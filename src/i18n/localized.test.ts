import { beforeEach, describe, expect, it } from "vitest";
import { router } from "@/router";
import { getLocale, setLocale } from "@/i18n";
import { legacyLangRedirect, localePath, routeLocale } from "./localized";
import { installLocaleGuard } from "./localeGuard";

installLocaleGuard(router);

describe("localized public pages", () => {
  beforeEach(() => setLocale("tr"));

  it("puts English pages under /en and leaves Turkish ones as they are", () => {
    expect(localePath("/", "tr")).toBe("/");
    expect(localePath("/", "en")).toBe("/en");
    expect(localePath("/privacy", "en")).toBe("/en/privacy");
    expect(localePath("/draw/join", "tr")).toBe("/draw/join");
  });

  it("reads the language from the URL of public pages only", () => {
    expect(routeLocale(router.resolve("/"))).toBe("tr");
    expect(routeLocale(router.resolve("/en"))).toBe("en");
    expect(routeLocale(router.resolve("/en/terms"))).toBe("en");
    expect(routeLocale(router.resolve("/draw/join"))).toBe("tr");
    expect(routeLocale(router.resolve("/dashboard"))).toBeNull();
    expect(routeLocale(router.resolve("/reveal/abc"))).toBeNull();
  });

  it("resolves every public page in both languages", () => {
    for (const name of ["home", "join-draw", "privacy", "terms", "support"]) {
      expect(router.resolve({ name, params: { lang: "" } }).name).toBe(name);
      expect(router.resolve({ name, params: { lang: "en" } }).path.startsWith("/en")).toBe(true);
    }
    expect(router.resolve("/en/nope").name).toBe("not-found");
    expect(router.resolve("/fr/privacy").name).toBe("not-found");
  });

  it("moves old ?lang= links to the page's own URL", () => {
    const to = router.resolve("/privacy?lang=en&x=1");
    const target = router.resolve(legacyLangRedirect(to)!);
    expect(target.fullPath).toBe("/en/privacy?x=1");
    expect(router.resolve(legacyLangRedirect(router.resolve("/en?lang=tr"))!).fullPath).toBe("/");
    expect(legacyLangRedirect(router.resolve("/dashboard?lang=en"))).toBeNull();
    expect(legacyLangRedirect(router.resolve("/privacy"))).toBeNull();
  });

  it("switches the language when navigating to a public page", async () => {
    await router.push("/en/privacy");
    expect(getLocale()).toBe("en");
    await router.push("/terms");
    expect(getLocale()).toBe("tr");
  });

  it("redirects the old Turkish aliases", () => {
    expect(router.resolve("/gizlilik").redirectedFrom).toBeUndefined();
    expect(router.resolve("/gizlilik").matched[0]?.redirect).toBe("/privacy");
  });
});
