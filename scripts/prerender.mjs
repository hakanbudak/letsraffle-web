// Writes the static HTML of every public page, the app shell, the 404 page and the sitemap
// into dist after `vite build` (see src/seo/prerender.ts). Loads the TypeScript sources through
// Vite so the content and i18n modules are used as they are.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

const vite = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  resolve: { alias: { "@": join(root, "src") } },
});

try {
  const { buildFiles } = await vite.ssrLoadModule("/src/seo/prerender.ts");
  const template = await readFile(join(dist, "index.html"), "utf8");
  const files = buildFiles(template);
  for (const { file, html } of files) {
    const target = join(dist, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  console.log(`prerender: wrote ${files.length} files`);
} finally {
  await vite.close();
}
