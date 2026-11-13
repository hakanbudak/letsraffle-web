import { beforeEach, describe, expect, it } from "vitest";
import { applySeo, canonicalUrl, isIndexable } from "./seo";
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
    expect(canonicalUrl(route("home", { query: { lang: "en" } }))).toBe("https://letsraffle.co/?lang=en");
    expect(canonicalUrl(route("privacy", { path: "/gizlilik" }))).toBe("https://letsraffle.co/privacy");
    expect(canonicalUrl(route("support", { path: "/destek" }))).toBe("https://letsraffle.co/support");
    expect(canonicalUrl(route("join-draw", { path: "/draw/join/miskin-penguen-53", params: { inviteCode: "x" } }))).toBe("https://letsraffle.co/draw/join");
  });

  it("writes title, description, robots and canonical for the home page", () => {
    applySeo(route("home"));
    expect(document.title).toBe("Yılbaşı Çekilişi Yap: Online Hediye Çekilişi – Lets Raffle");
    expect(meta('meta[name="description"]')).toContain("yılbaşı çekilişi");
    expect(meta('meta[name="robots"]')).toBe("index, follow");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://letsraffle.co/");
    expect(meta('meta[property="og:title"]')).toBe(document.title);
  });

  it("follows the language", () => {
    i18n.global.locale.value = "en";
    applySeo(route("home"));
    expect(document.title).toContain("Secret Santa");
  });

  it("keeps personal pages out of search results and leaves their link preview alone", () => {
    applySeo(route("dashboard", { path: "/dashboard" }));
    expect(meta('meta[name="robots"]')).toBe("noindex, nofollow");
    expect(document.head.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.title).toContain("Lets Raffle");
  });
});
