import type { RouteLocationNormalizedLoaded } from "vue-router";
import { i18n, type Locale } from "@/i18n";
import { localePath, routeLocale } from "@/i18n/localized";

/**
 * Per-page <title>, description, canonical and robots tags.
 *
 * The site is a single-page app, so these are set on the client after each navigation;
 * search engines that render JavaScript pick them up. The tags in index.html are the fallback
 * (and what link previews in chat apps read).
 *
 * Note for the `seo.*` messages: vue-i18n reads "|" as a plural separator, so titles use "–" or ":".
 */
export const SITE_URL = "https://letsraffle.co";

/** route name → key under `seo.` in the messages */
const PAGE_KEYS: Record<string, string> = {
  home: "home",
  "join-draw": "join",
  privacy: "privacy",
  terms: "terms",
  support: "support",
};

/** only public, content pages are indexed; everything personal (dashboard, draws, reveal links …) is not */
export function isIndexable(route: Pick<RouteLocationNormalizedLoaded, "name" | "params">): boolean {
  const name = String(route.name ?? "");
  if (!(name in PAGE_KEYS)) return false;
  // an invite link is personal to a group: index the "enter your code" page, not every draw
  if (name === "join-draw" && route.params.inviteCode) return false;
  return true;
}

/** route name → its Turkish path; the English one is the same under /en */
const PAGE_PATHS: Record<string, string> = {
  home: "/",
  "join-draw": "/draw/join",
  privacy: "/privacy",
  terms: "/terms",
  support: "/support",
};

type SeoRoute = Pick<RouteLocationNormalizedLoaded, "name" | "path" | "params">;

/** the page's address in the given language (public pages only) */
export function pageUrl(name: string, locale: Locale): string {
  return `${SITE_URL}${localePath(PAGE_PATHS[name] ?? "/", locale)}`;
}

export function canonicalUrl(route: SeoRoute): string {
  const name = String(route.name ?? "");
  const locale = routeLocale(route);
  if (!(name in PAGE_PATHS) || !locale) return `${SITE_URL}${route.path}`;
  return pageUrl(name, locale);
}

/** hreflang alternates of a public page: Turkish, English, and Turkish as the default */
export function alternateUrls(route: SeoRoute): { hreflang: string; href: string }[] {
  const name = String(route.name ?? "");
  if (!(name in PAGE_PATHS)) return [];
  return [
    { hreflang: "tr", href: pageUrl(name, "tr") },
    { hreflang: "en", href: pageUrl(name, "en") },
    { hreflang: "x-default", href: pageUrl(name, "tr") },
  ];
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setAlternates(links: { hreflang: string; href: string }[]) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove());
  for (const { hreflang, href } of links) {
    const element = document.createElement("link");
    element.setAttribute("rel", "alternate");
    element.setAttribute("hreflang", hreflang);
    element.setAttribute("href", href);
    document.head.appendChild(element);
  }
}

export function applySeo(route: RouteLocationNormalizedLoaded) {
  if (typeof document === "undefined") return;
  const { t } = i18n.global;
  const key = PAGE_KEYS[String(route.name ?? "")] ?? "default";
  const title = t(`seo.${key}.title`);
  const description = t(`seo.${key}.description`);
  const indexable = isIndexable(route);

  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", indexable ? "index, follow" : "noindex, nofollow");
  setCanonical(canonicalUrl(route));
  setAlternates(indexable ? alternateUrls(route) : []);
  document.documentElement.setAttribute("lang", String(i18n.global.locale.value));

  // The Open Graph tags stay as shipped for invite links (chat apps read the static HTML anyway);
  // only the public pages describe themselves.
  if (indexable) {
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl(route));
    const english = i18n.global.locale.value === "en";
    setMeta("property", "og:locale", english ? "en_US" : "tr_TR");
    setMeta("property", "og:locale:alternate", english ? "tr_TR" : "en_US");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
  }
}
