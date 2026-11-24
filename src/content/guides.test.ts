import { describe, expect, it } from "vitest";
import { counterpart, guides } from "./guides";
import { router } from "@/router";
import { alternateUrls, canonicalUrl, isIndexable } from "@/utils/seo";
import { otherLanguageTarget, routeLocale } from "@/i18n/localized";

describe("guide pages", () => {
  it("have unique paths, Turkish without a prefix and English under /en", () => {
    expect(new Set(guides.map((g) => g.path)).size).toBe(guides.length);
    for (const guide of guides) {
      expect(guide.path.startsWith("/en/")).toBe(guide.locale === "en");
      expect(guide.path).not.toMatch(/20\d\d/); // no year: the URL keeps its history every season
    }
  });

  it("keep titles and descriptions within what search results show", () => {
    for (const guide of guides) {
      expect(guide.title.length, guide.path).toBeLessThanOrEqual(75);
      expect(guide.description.length, guide.path).toBeLessThanOrEqual(175);
      expect(guide.description.length, guide.path).toBeGreaterThan(80);
    }
  });

  it("resolve to their own route with the right language, canonical and hreflang", () => {
    for (const guide of guides) {
      const route = router.resolve(guide.path);
      expect(route.name).toBe(`guide:${guide.path}`);
      expect(routeLocale(route)).toBe(guide.locale);
      expect(isIndexable(route)).toBe(true);
      expect(canonicalUrl(route)).toBe(`https://letsraffle.co${guide.path}`);
      const alternates = alternateUrls(route);
      expect(alternates.find((a) => a.hreflang === guide.locale)?.href).toBe(`https://letsraffle.co${guide.path}`);
      expect(alternates.at(-1)?.hreflang).toBe("x-default");
    }
  });

  it("switch language to the counterpart, or to the home page when there is none", () => {
    const office = router.resolve("/ofis-yilbasi-cekilisi");
    expect(otherLanguageTarget(office, "en")).toBe("/en/office-secret-santa");
    const names = router.resolve("/isim-cekme");
    expect(counterpart(guides.find((g) => g.path === "/isim-cekme")!)).toBeUndefined();
    expect(otherLanguageTarget(names, "en")).toBe("/en");
  });

  it("do not promise exclusions or wish lists the product does not have", () => {
    const text = JSON.stringify(guides).toLowerCase();
    expect(text).not.toMatch(/exclusion rules|hariç tut/);
  });
});
