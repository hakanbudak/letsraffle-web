import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildFiles, fileFor, staticPages } from "./prerender";
import { guides } from "@/content/guides";
import serveConfig from "../../public/serve.json";

// vitest runs from the project root
const template = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const files = Object.fromEntries(buildFiles(template).map((f) => [f.file, f.html]));
const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

describe("prerender", () => {
  it("writes every public page in both languages plus the guides", () => {
    const paths = staticPages().map((p) => p.path);
    for (const path of ["/", "/en", "/draw/join", "/en/draw/join", "/privacy", "/en/privacy", "/terms", "/en/terms", "/support", "/en/support"]) {
      expect(paths).toContain(path);
    }
    for (const guide of guides) expect(paths).toContain(guide.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("maps paths to files the static server finds with clean URLs", () => {
    expect(fileFor("/")).toBe("index.html");
    expect(fileFor("/en")).toBe("en.html");
    expect(fileFor("/en/privacy")).toBe("en/privacy.html");
  });

  it("gives each page its own language, title, canonical, hreflang and one h1", () => {
    for (const page of staticPages()) {
      const html = files[page.file];
      expect(html, page.path).toContain(`<html lang="${page.locale}">`);
      expect(html).toContain(`<link rel="canonical" href="${page.canonical}">`);
      expect(count(html, /<link rel="canonical"/g)).toBe(1);
      expect(count(html, /<title>/g)).toBe(1);
      expect(count(html, /<h1>/g)).toBe(1);
      expect(count(html, /hreflang="x-default"/g)).toBe(1);
      expect(html).not.toContain("noindex");
      expect(html).toContain('<div class="static-page">');
    }
    expect(files["en.html"]).toContain("<title>Secret Santa Generator");
    expect(files["index.html"]).toContain("<h1>Online yılbaşı hediye çekilişi</h1>");
  });

  it("escapes text taken from the content", () => {
    for (const html of Object.values(files)) expect(html).not.toMatch(/<li>[^<]*<script/);
  });

  it("keeps the app shell and the 404 page out of the index", () => {
    for (const file of ["app.html", "404.html"]) {
      expect(files[file]).toContain('<meta name="robots" content="noindex, nofollow">');
      expect(files[file]).not.toContain('rel="canonical"');
      expect(files[file]).not.toContain("hreflang");
    }
    // invite links keep their chat preview
    expect(files["app.html"]).toContain('property="og:image"');
  });

  it("lists every page in the sitemap", () => {
    const sitemap = files["sitemap.xml"];
    expect(count(sitemap, /<loc>/g)).toBe(staticPages().length);
    expect(sitemap).not.toContain("?lang=");
  });

  it("rewrites every app route to the app shell", () => {
    const sources = serveConfig.rewrites.map((r) => r.source);
    for (const route of ["/dashboard", "/draw/manual", "/draw/dynamic", "/draws/:code", "/draw/join/:code", "/reveal/:token", "/forgot-password", "/reset-password"]) {
      expect(sources).toContain(route);
    }
    expect(serveConfig.rewrites.every((r) => r.destination === "/app.html")).toBe(true);
  });
});
