import type { Router } from "vue-router";
import { getLocale, setLocale } from "@/i18n";
import { legacyLangRedirect, routeLocale } from "@/i18n/localized";

/** On public pages the URL decides the language; old `?lang=` links move to the page's own URL. */
export function installLocaleGuard(router: Router) {
  router.beforeEach((to) => {
    const redirect = legacyLangRedirect(to);
    if (redirect) return redirect;
    const locale = routeLocale(to);
    if (locale && locale !== getLocale()) setLocale(locale);
  });
}
