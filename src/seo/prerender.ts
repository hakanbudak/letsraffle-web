/**
 * Static HTML for every public page, written by `scripts/prerender.mjs` after `vite build`.
 *
 * Crawlers that do not run JavaScript (Bing, Yandex, AI search, link previews) get each page's
 * own head and its text. The text sits inside `#app`, so Vue replaces it on mount; it is the same
 * copy the app shows (src/content/*, the i18n messages), only without the styling.
 *
 * Also builds the app shell (`app.html`, for dashboard / draw / reveal / invite links), the 404
 * page and the sitemap from the same page list.
 */
import { i18n, type Locale } from "@/i18n";
import { localePath } from "@/i18n/localized";
import { guides, guidesFor, type Guide } from "@/content/guides";
import { homeContent } from "@/content/home";
import { guideUi } from "@/content/guideUi";
import { legal, type LegalDoc } from "@/content/legal";
import { SITE_URL, alternateUrls, canonicalUrl } from "@/utils/seo";

export interface StaticPage {
  /** URL path, e.g. `/en/privacy` */
  path: string;
  /** output file inside dist, e.g. `en/privacy.html` */
  file: string;
  locale: Locale;
  title: string;
  description: string;
  canonical: string;
  alternates: { hreflang: string; href: string }[];
  body: string;
  jsonLd?: object[];
}

export interface OutputFile {
  file: string;
  html: string;
}

const LOCALES: Locale[] = ["tr", "en"];
const LEGAL_DOCS: LegalDoc[] = ["privacy", "terms", "support"];

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const t = (key: string, locale: Locale) => String(i18n.global.t(key, {}, { locale }));

/** `/` → `index.html`, `/en` → `en.html`, `/en/privacy` → `en/privacy.html` (served with clean URLs) */
export const fileFor = (path: string) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);

const list = (items: string[]) => `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`;

const faqJsonLd = (faq: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
});

/** links every static page ends with, so crawlers can reach the other public pages */
function footer(locale: Locale): string {
  const links = [
    { href: localePath("/", locale), text: guideUi[locale].home },
    ...guidesFor(locale).map((guide) => ({ href: guide.path, text: guide.linkText })),
    ...LEGAL_DOCS.map((doc) => ({ href: localePath(`/${doc}`, locale), text: legal[doc][locale].title })),
  ];
  return `<nav><ul>${links.map((link) => `<li><a href="${link.href}">${escape(link.text)}</a></li>`).join("")}</ul></nav>`;
}

/** a route-shaped object for the SEO helpers, which work from the router's view of a page */
const routeOf = (name: string, locale: Locale, path: string, guidePath?: string) =>
  ({ name, path, params: { lang: locale === "en" ? "en" : "" }, meta: guidePath ? { guidePath } : {} }) as never;

function homePage(locale: Locale): StaticPage {
  const c = homeContent[locale];
  const path = localePath("/", locale);
  const route = routeOf("home", locale, path);
  const body = [
    `<h1>${escape(t("landing.seoHeading", locale))}</h1>`,
    list(["setup", "fair", "secret"].map((key) => t(`landing.heroPoints.${key}`, locale))),
    `<h2>${escape(c.heading)}</h2>`,
    `<p>${escape(c.intro)}</p>`,
    `<h3>${escape(c.stepsHeading)}</h3>`,
    `<ol>${c.steps.map((step) => `<li><h4>${escape(step.title)}</h4><p>${escape(step.text)}</p></li>`).join("")}</ol>`,
    `<h3>${escape(c.modesHeading)}</h3>`,
    ...c.modes.map((mode) => `<h4>${escape(mode.title)}</h4><p>${escape(mode.text)}</p>`),
    `<h3>${escape(c.faqHeading)}</h3>`,
    ...c.faq.map((item) => `<h4>${escape(item.q)}</h4><p>${escape(item.a)}</p>`),
  ].join("");
  return {
    path,
    file: fileFor(path),
    locale,
    title: t("seo.home.title", locale),
    description: t("seo.home.description", locale),
    canonical: canonicalUrl(route),
    alternates: alternateUrls(route),
    body,
    jsonLd: [faqJsonLd(c.faq)],
  };
}

function joinPage(locale: Locale): StaticPage {
  const path = localePath("/draw/join", locale);
  const route = routeOf("join-draw", locale, path);
  return {
    path,
    file: fileFor(path),
    locale,
    title: t("seo.join.title", locale),
    description: t("seo.join.description", locale),
    canonical: canonicalUrl(route),
    alternates: alternateUrls(route),
    body: `<h1>${escape(t("join.code.heroHeading", locale))}</h1><p>${escape(t("seo.join.description", locale))}</p><p>${escape(t("join.code.hint", locale))}</p>`,
  };
}

function legalPage(doc: LegalDoc, locale: Locale): StaticPage {
  const content = legal[doc][locale];
  const path = localePath(`/${doc}`, locale);
  const route = routeOf(doc, locale, path);
  const sections = content.sections
    .map((section) =>
      [
        `<h2>${escape(section.heading)}</h2>`,
        ...(section.paragraphs ?? []).map((p) => `<p>${escape(p)}</p>`),
        section.items ? list(section.items) : "",
        section.note ? `<p>${escape(section.note)}</p>` : "",
      ].join(""),
    )
    .join("");
  return {
    path,
    file: fileFor(path),
    locale,
    title: t(`seo.${doc}.title`, locale),
    description: t(`seo.${doc}.description`, locale),
    canonical: canonicalUrl(route),
    alternates: alternateUrls(route),
    body: `<h1>${escape(content.title)}</h1><p>${escape(content.updated)}</p><p>${escape(content.intro)}</p>${sections}`,
  };
}

function guidePage(guide: Guide): StaticPage {
  const route = routeOf(`guide:${guide.path}`, guide.locale, guide.path, guide.path);
  const ui = guideUi[guide.locale];
  const sections = guide.sections
    .map((section) =>
      [`<h2>${escape(section.heading)}</h2>`, ...(section.paragraphs ?? []).map((p) => `<p>${escape(p)}</p>`), section.items ? list(section.items) : ""].join(""),
    )
    .join("");
  const faq = guide.faq.length
    ? `<h2>${escape(ui.faq)}</h2>${guide.faq.map((item) => `<h3>${escape(item.q)}</h3><p>${escape(item.a)}</p>`).join("")}`
    : "";
  const home = `${SITE_URL}${localePath("/", guide.locale)}`;
  return {
    path: guide.path,
    file: fileFor(guide.path),
    locale: guide.locale,
    title: guide.title,
    description: guide.description,
    canonical: canonicalUrl(route),
    alternates: alternateUrls(route),
    body: `<nav><a href="${localePath("/", guide.locale)}">${escape(ui.home)}</a> › ${escape(guide.linkText)}</nav><h1>${escape(guide.h1)}</h1><p>${escape(guide.intro)}</p>${sections}${faq}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: home },
          { "@type": "ListItem", position: 2, name: guide.linkText, item: `${SITE_URL}${guide.path}` },
        ],
      },
      ...(guide.faq.length ? [faqJsonLd(guide.faq)] : []),
    ],
  };
}

/** every indexable page, in both languages where it exists */
export function staticPages(): StaticPage[] {
  return [
    ...LOCALES.map(homePage),
    ...LOCALES.map(joinPage),
    ...LEGAL_DOCS.flatMap((doc) => LOCALES.map((locale) => legalPage(doc, locale))),
    ...guides.map(guidePage),
  ];
}

// --- HTML ---------------------------------------------------------------------------------------

/** set one tag's attribute in the template; fails loudly if the template changed shape */
function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) throw new Error(`prerender: template has no match for ${pattern}`);
  return html.replace(pattern, replacement);
}

const metaContent = (html: string, attr: "name" | "property", key: string, value: string) =>
  replaceTag(html, new RegExp(`<meta ${attr}="${key}" content="[^"]*">`), `<meta ${attr}="${key}" content="${escape(value)}">`);

const withoutHreflang = (html: string) => html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, "");

const withBody = (html: string, body: string) =>
  replaceTag(html, /<div id="app"><\/div>/, `<div id="app"><div class="static-page">${body}</div></div>`);

/** one public page: its own head and its text inside #app */
export function renderPage(template: string, page: StaticPage): string {
  let html = template;
  html = replaceTag(html, /<html lang="[a-z]+">/, `<html lang="${page.locale}">`);
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`);
  html = metaContent(html, "name", "description", page.description);
  html = replaceTag(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${page.canonical}">`);
  html = withoutHreflang(html).replace(
    /(<link rel="canonical" href="[^"]*">)/,
    `$1${page.alternates.map((a) => `\n    <link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`).join("")}`,
  );
  html = metaContent(html, "property", "og:url", page.canonical);
  html = metaContent(html, "property", "og:title", page.title);
  html = metaContent(html, "property", "og:description", page.description);
  html = metaContent(html, "property", "og:locale", page.locale === "en" ? "en_US" : "tr_TR");
  html = metaContent(html, "property", "og:locale:alternate", page.locale === "en" ? "tr_TR" : "en_US");
  const jsonLd = (page.jsonLd ?? []).map((data) => `\n    <script type="application/ld+json">${JSON.stringify(data)}</script>`).join("");
  html = html.replace("</head>", `${jsonLd}\n  </head>`);
  return withBody(html, `${page.body}${footer(page.locale)}`);
}

/** the shell for app pages: not indexed, keeps the invite link preview tags from index.html */
export function renderAppShell(template: string): string {
  let html = withoutHreflang(template);
  html = html.replace(/\s*<link rel="canonical" href="[^"]*">/, "");
  return html.replace("<head>", '<head>\n    <meta name="robots" content="noindex, nofollow">');
}

/** the 404 page: the app shell (so the app renders its own not-found page) with a short text */
export function renderNotFound(template: string): string {
  const body = `<h1>${escape(t("notFound.title", "tr"))}</h1><p>${escape(t("notFound.description", "tr"))}</p>${footer("tr")}`;
  const shell = replaceTag(renderAppShell(template), /<title>[^<]*<\/title>/, `<title>${escape(t("notFound.title", "tr"))} – Lets Raffle</title>`);
  return withBody(shell, body);
}

export function sitemapXml(pages: StaticPage[] = staticPages()): string {
  const urls = pages
    .map((page) => {
      const links = page.alternates.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`).join("");
      return `  <url>\n    <loc>${page.canonical}</loc>${links}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

/** everything the build writes into dist besides Vite's own output */
export function buildFiles(template: string): OutputFile[] {
  const pages = staticPages();
  return [
    ...pages.map((page) => ({ file: page.file, html: renderPage(template, page) })),
    { file: "app.html", html: renderAppShell(template) },
    { file: "404.html", html: renderNotFound(template) },
    { file: "sitemap.xml", html: sitemapXml(pages) },
  ];
}

