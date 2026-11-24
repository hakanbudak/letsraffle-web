import { beforeEach, describe, expect, it } from "vitest";
import { alternateUrls, applySeo, canonicalUrl, isIndexable } from "./seo";
import { i18n } from "@/i18n";

const route = (name: string, extra: Record<string, unknown> = {}) =>
  ({ name, path: "/", params: {}, query: {}, ...extra }) as any;

const meta = (selector: string) => document.head.querySelector(selector)?.getAttribute("content");

describe("seo", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    i18n.global.locale.value = "tr";
  });

  it("indexes only the public pages", () => {
    expect(isIndexable(route("home"))).toBe(true);
    expect(isIndexable(route("privacy"))).toBe(true);
    expect(isIndexable(route("support"))).toBe(true);
    expect(isIndexable(route("join-draw"))).toBe(true);
    expect(isIndexable(route("join-draw", { params: { inviteCode: "miskin-penguen-53" } }))).toBe(false);
    for (const name of ["dashboard", "reveal", "draw-invite-detail", "reset-password", "not-found"]) {
      expect(isIndexable(route(name))).toBe(false);
    }
  });

  it("builds one canonical address per page and language", () => {
    expect(canonicalUrl(route("home"))).toBe("https://letsraffle.co/");
    expect(canonicalUrl(route("home", { params: { lang: "en" } }))).toBe("https://letsraffle.co/en");
    expect(canonicalUrl(route("privacy"))).toBe("https://letsraffle.co/privacy");
    expect(canonicalUrl(route("privacy", { params: { lang: "en" } }))).toBe("https://letsraffle.co/en/privacy");
    expect(canonicalUrl(route("support"))).toBe("https://letsraffle.co/support");
    expect(canonicalUrl(route("join-draw", { path: "/draw/join/miskin-penguen-53", params: { inviteCode: "x" } }))).toBe("https://letsraffle.co/draw/join");
  });

  it("links each public page to its other language", () => {
    expect(alternateUrls(route("privacy", { params: { lang: "en" } }))).toEqual([
      { hreflang: "tr", href: "https://letsraffle.co/privacy" },
      { hreflang: "en", href: "https://letsraffle.co/en/privacy" },
      { hreflang: "x-default", href: "https://letsraffle.co/privacy" },
    ]);
    expect(alternateUrls(route("dashboard"))).toEqual([]);
  });

  it("writes title, description, robots and canonical for the home page", () => {
    applySeo(route("home"));
    expect(document.title).toBe("Yılbaşı Çekilişi Yap: Online Hediye Çekilişi – Lets Raffle");
    expect(meta('meta[name="description"]')).toContain("yılbaşı çekilişi");
    expect(meta('meta[name="robots"]')).toBe("index, follow");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://letsraffle.co/");
    expect(meta('meta[property="og:title"]')).toBe(document.title);
    expect(meta('meta[property="og:locale"]')).toBe("tr_TR");
    expect(document.documentElement.getAttribute("lang")).toBe("tr");
    const hreflangs = [...document.head.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.getAttribute("hreflang"));
    expect(hreflangs).toEqual(["tr", "en", "x-default"]);
  });

  it("follows the language", () => {
    i18n.global.locale.value = "en";
    applySeo(route("home", { params: { lang: "en" } }));
    expect(document.title).toContain("Secret Santa");
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://letsraffle.co/en");
  });

  it("keeps personal pages out of search results and leaves their link preview alone", () => {
    applySeo(route("dashboard", { path: "/dashboard" }));
    expect(meta('meta[name="robots"]')).toBe("noindex, nofollow");
    expect(document.head.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.head.querySelector('link[rel="alternate"][hreflang]')).toBeNull();
    expect(document.title).toContain("Lets Raffle");
  });
});
