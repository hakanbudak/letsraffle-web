import type { RouteLocationNormalizedLoaded } from "vue-router";
import { i18n } from "@/i18n";

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
};

/** only public, content pages are indexed; everything personal (dashboard, draws, reveal links …) is not */
export function isIndexable(route: Pick<RouteLocationNormalizedLoaded, "name" | "params">): boolean {
  const name = String(route.name ?? "");
  if (!(name in PAGE_KEYS)) return false;
  // an invite link is personal to a group: index the "enter your code" page, not every draw
  if (name === "join-draw" && route.params.inviteCode) return false;
  return true;
}

export function canonicalUrl(route: Pick<RouteLocationNormalizedLoaded, "name" | "path" | "query">): string {
  const name = String(route.name ?? "");
  const path = name === "home" ? "/" : name === "join-draw" ? "/draw/join" : name === "privacy" ? "/privacy" : name === "terms" ? "/terms" : route.path;
  const lang = route.query.lang === "tr" || route.query.lang === "en" ? `?lang=${route.query.lang}` : "";
  return `${SITE_URL}${path}${lang}`;
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

  // The Open Graph tags stay as shipped for invite links (chat apps read the static HTML anyway);
  // only the public pages describe themselves.
  if (indexable) {
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl(route));
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
  }
}
