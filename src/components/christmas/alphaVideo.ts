/**
 * Transparent looping videos for the Blender characters.
 *
 * Animated WebP is decoded frame-by-frame on the CPU, which makes phones (iOS Safari in
 * particular) stutter while a big Santa loops. Videos are decoded by the GPU instead:
 * - Safari / iOS (every iOS browser is WebKit): HEVC with alpha (.mov, hvc1)
 * - Chrome / Firefox / Edge / Android: VP9 with alpha (.webm)
 * Built from the same frames as the WebPs (art/_vsrc -> src/assets/video).
 */
const webm = import.meta.glob("@/assets/video/*.webm", { eager: true, import: "default" }) as Record<string, string>;
const mov = import.meta.glob("@/assets/video/*.mov", { eager: true, import: "default" }) as Record<string, string>;

type Kind = "mov" | "webm" | null;
let kind: Kind | undefined;

function detect(): Kind {
  if (typeof document === "undefined" || typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const v = document.createElement("video");
  if (typeof v.canPlayType !== "function") return null;
  const apple = /iP(hone|ad|od)/.test(ua) ||
      (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua));
  if (apple) return v.canPlayType('video/mp4; codecs="hvc1"') ? "mov" : null;
  return v.canPlayType('video/webm; codecs="vp9"') ? "webm" : null;
}

/** url of the transparent video for e.g. "santa-draw" / "snowman", or "" when this browser should keep the WebP */
export function alphaVideo(name: string): string {
  if (kind === undefined) kind = detect();
  if (!kind) return "";
  const table = kind === "mov" ? mov : webm;
  return Object.entries(table).find(([k]) => k.endsWith(`/${name}.${kind}`))?.[1] ?? "";
}

/** start playback even when the autoplay attribute was ignored; reports a refusal (e.g. iOS Low Power Mode) */
export function kickVideo(e: Event, onFail: () => void) {
  const v = e.target as HTMLVideoElement;
  v.muted = true;
  const p = v.play();
  if (p && typeof p.catch === "function") p.catch(onFail);
}
