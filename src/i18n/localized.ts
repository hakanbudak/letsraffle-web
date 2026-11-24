import { useI18n } from "vue-i18n";
import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import type { Locale } from "@/i18n";
import { counterpart, findGuide } from "@/content/guides";

/**
 * Public pages exist once per language: Turkish without a prefix (`/privacy`), English under
 * `/en` (`/en/privacy`). On these pages the URL alone decides the language, so a search engine
 * crawling with an English browser still sees the Turkish page at `/`.
 *
 * Guide pages (src/content/guides.ts) have their own slug in each language; their route carries
 * `meta.guidePath`.
 *
 * App pages (dashboard, draws, reveal, invite links) have a single URL and keep using the
 * stored or browser language.
 */
export const LOCALIZED_ROUTE_NAMES: ReadonlySet<string> = new Set(["home", "join-draw", "privacy", "terms", "support"]);

/** the `lang` route param for a locale: "en" for English, empty (no prefix) for Turkish */
export const langParam = (locale: Locale) => (locale === "en" ? "en" : "");

type RouteLike = Pick<RouteLocationNormalized, "name" | "params"> & { meta?: RouteLocationNormalized["meta"] };

/** the guide a route shows, if it is a guide page */
export function routeGuide(route: { meta?: RouteLocationNormalized["meta"] }) {
  const path = route.meta?.guidePath;
  return typeof path === "string" ? findGuide(path) : undefined;
}

export function isLocalizedRoute(route: Pick<RouteLocationNormalized, "name"> & { meta?: RouteLocationNormalized["meta"] }): boolean {
  return LOCALIZED_ROUTE_NAMES.has(String(route.name ?? "")) || Boolean(routeGuide(route));
}

/** the language a public page's URL stands for, or null for app pages */
export function routeLocale(route: RouteLike): Locale | null {
  const guide = routeGuide(route);
  if (guide) return guide.locale;
  if (!isLocalizedRoute(route)) return null;
  return route.params.lang === "en" ? "en" : "tr";
}

/** where the language switcher goes from a public page: the same page in the other language */
export function otherLanguageTarget(
  route: Pick<RouteLocationNormalized, "name" | "params" | "query" | "hash" | "meta">,
  locale: Locale,
): RouteLocationRaw | null {
  const guide = routeGuide(route);
  if (guide) return counterpart(guide)?.path ?? localePath("/", locale);
  if (!LOCALIZED_ROUTE_NAMES.has(String(route.name ?? ""))) return null;
  return { name: route.name!, params: { ...route.params, lang: langParam(locale) }, query: route.query, hash: route.hash };
}

/** `/privacy` → `/en/privacy` for English; Turkish paths stay as they are */
export function localePath(path: string, locale: Locale): string {
  if (locale !== "en") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** old `?lang=en` / `?lang=tr` links on public pages → the page's URL in that language */
export function legacyLangRedirect(
  to: Pick<RouteLocationNormalized, "name" | "params" | "query" | "hash">,
): RouteLocationRaw | null {
  const lang = to.query.lang;
  if (!LOCALIZED_ROUTE_NAMES.has(String(to.name ?? "")) || (lang !== "en" && lang !== "tr")) return null;
  const { lang: _dropped, ...query } = to.query;
  return { name: to.name!, params: { ...to.params, lang: langParam(lang) }, query, hash: to.hash, replace: true };
}

/** `localePath` bound to the current language, for links inside components */
export function useLocalePath() {
  const { locale } = useI18n();
  return (path: string) => localePath(path, locale.value as Locale);
}
