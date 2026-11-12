import QRCode from "qrcode";

/**
 * Invitation pictures for sharing: a 9:16 story card and an A4 poster.
 *
 * The artwork (scene, Santa, ticket, texts, logo) is a pre-rendered template in
 * /public/share, exported from the iOS app's SwiftUI cards so both platforms look the same.
 * Only the parts that depend on the draw are painted here: its name and number,
 * the invite code and, on the poster, the QR code.
 */
export type InviteCardKind = "story" | "poster";
export type InviteCardLocale = "tr" | "en";

interface Spec {
  width: number;
  height: number;
  /** vertical centre of the "Miskin Penguen  No. 768" row */
  nameY: number;
  nameSize: number;
  nameMaxWidth: number;
  chipHeight: number;
  chipFont: number;
  chipPad: number;
  chipTracking: number;
  gap: number;
  /** vertical centre of the invite code capsule */
  codeY: number;
  codeHeight: number;
  codeFont: number;
  codePad: number;
  codeStroke: number;
  codeMaxWidth: number;
  qr?: Record<InviteCardLocale, { x: number; y: number; size: number }>;
}

// measured on the exported templates (pixels)
const SPECS: Record<InviteCardKind, Spec> = {
  story: {
    width: 1080, height: 1920,
    nameY: 942, nameSize: 75, nameMaxWidth: 790, chipHeight: 60, chipFont: 30, chipPad: 24, chipTracking: 3, gap: 24,
    codeY: 1313, codeHeight: 114, codeFont: 57, codePad: 48, codeStroke: 6, codeMaxWidth: 780,
  },
  poster: {
    width: 1785, height: 2526,
    nameY: 961, nameSize: 120, nameMaxWidth: 1310, chipHeight: 84, chipFont: 42, chipPad: 36, chipTracking: 4.2, gap: 36,
    codeY: 1852.5, codeHeight: 156, codeFont: 81, codePad: 78, codeStroke: 9, codeMaxWidth: 1300,
    qr: { tr: { x: 370, y: 1177, size: 384 }, en: { x: 332, y: 1177, size: 384 } },
  },
};

const DISPLAY = '"Fraunces Variable", "Fraunces", Georgia, serif';
const BODY = '"Nunito Variable", "Nunito", system-ui, sans-serif';

/** "miskin-penguen-768" → { name: "Miskin Penguen", number: "768" } */
export function inviteCardTitle(code: string, locale: InviteCardLocale): { name: string; number: string | null } {
  const parts = code.split("-").filter(Boolean);
  const isNumber = (p: string) => /^\d+$/.test(p);
  const words = parts.filter((p) => !isNumber(p));
  const last = parts[parts.length - 1];
  const name = words.length
    ? words.map((w) => w.charAt(0).toLocaleUpperCase(locale) + w.slice(1)).join(" ")
    : code;
  return { name, number: last && isNumber(last) ? last : null };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function capsule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
}

/** Vertical centre of the text's ink, so capitals sit in the middle whatever the font metrics are. */
function drawCentred(ctx: CanvasRenderingContext2D, text: string, x: number, centreY: number, sample = text) {
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText(sample);
  const y = centreY + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  ctx.fillText(text, x, y);
}

export async function renderInviteCard(
  kind: InviteCardKind,
  options: { code: string; url: string; locale: InviteCardLocale; base?: string },
): Promise<Blob> {
  const spec = SPECS[kind];
  const { code, url, locale } = options;
  const base = options.base ?? "/share/";

  const [template] = await Promise.all([
    loadImage(`${base}${kind}-${locale}.jpg`),
    document.fonts?.load(`900 ${spec.nameSize}px ${DISPLAY}`, code).catch(() => undefined),
    document.fonts?.load(`900 ${spec.chipFont}px ${BODY}`, "No. 0123456789").catch(() => undefined),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas is not available");
  ctx.drawImage(template, 0, 0, spec.width, spec.height);
  const cx = spec.width / 2;

  // ── name + "No. 768" ──
  const { name, number } = inviteCardTitle(code, locale);
  const chipText = number ? `No. ${number}` : "";
  const tracked = ctx as CanvasRenderingContext2D & { letterSpacing?: string };

  const setChipFont = () => {
    ctx.font = `900 ${spec.chipFont}px ${BODY}`;
    if ("letterSpacing" in tracked) tracked.letterSpacing = `${spec.chipTracking}px`;
  };
  const resetTracking = () => {
    if ("letterSpacing" in tracked) tracked.letterSpacing = "0px";
  };

  setChipFont();
  const chipWidth = number ? ctx.measureText(chipText).width + spec.chipPad * 2 : 0;
  resetTracking();

  let nameSize = spec.nameSize;
  ctx.font = `900 ${nameSize}px ${DISPLAY}`;
  let nameWidth = ctx.measureText(name).width;
  const room = spec.nameMaxWidth - (number ? chipWidth + spec.gap : 0);
  if (nameWidth > room) {
    nameSize = Math.max(spec.nameSize * 0.3, (nameSize * room) / nameWidth);
    ctx.font = `900 ${nameSize}px ${DISPLAY}`;
    nameWidth = ctx.measureText(name).width;
  }
  const rowWidth = nameWidth + (number ? spec.gap + chipWidth : 0);
  const left = cx - rowWidth / 2;

  ctx.fillStyle = "#7a0f14";
  ctx.textAlign = "left";
  drawCentred(ctx, name, left, spec.nameY, "Hx");

  if (number) {
    const x = left + nameWidth + spec.gap;
    const y = spec.nameY - spec.chipHeight / 2;
    const gold = ctx.createLinearGradient(0, y, 0, y + spec.chipHeight);
    gold.addColorStop(0, "#f8e09a");
    gold.addColorStop(1, "#e6b94a");
    ctx.fillStyle = gold;
    capsule(ctx, x, y, chipWidth, spec.chipHeight);
    ctx.fill();
    setChipFont();
    ctx.fillStyle = "#5a0a0f";
    drawCentred(ctx, chipText, x + spec.chipPad, spec.nameY, "N0");
    resetTracking();
  }

  // ── QR (poster) ──
  if (spec.qr) {
    const box = spec.qr[locale];
    const qr = document.createElement("canvas");
    await QRCode.toCanvas(qr, url, { margin: 0, width: box.size, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, box.x, box.y, box.size, box.size);
    ctx.imageSmoothingEnabled = true;
  }

  // ── invite code capsule ──
  let codeFont = spec.codeFont;
  ctx.font = `900 ${codeFont}px ${DISPLAY}`;
  let codeWidth = ctx.measureText(code).width;
  const codeRoom = spec.codeMaxWidth - spec.codePad * 2;
  if (codeWidth > codeRoom) {
    codeFont = (codeFont * codeRoom) / codeWidth;
    ctx.font = `900 ${codeFont}px ${DISPLAY}`;
    codeWidth = ctx.measureText(code).width;
  }
  const w = codeWidth + spec.codePad * 2;
  const x = cx - w / 2;
  const y = spec.codeY - spec.codeHeight / 2;
  const red = ctx.createLinearGradient(0, y, 0, y + spec.codeHeight);
  red.addColorStop(0, "#d0282f");
  red.addColorStop(0.5, "#a3171c");
  red.addColorStop(1, "#7a0f14");
  ctx.fillStyle = red;
  capsule(ctx, x, y, w, spec.codeHeight);
  ctx.fill();
  const inset = spec.codeStroke / 2;
  ctx.strokeStyle = "#f6d98a";
  ctx.lineWidth = spec.codeStroke;
  capsule(ctx, x + inset, y + inset, w - spec.codeStroke, spec.codeHeight - spec.codeStroke);
  ctx.stroke();
  ctx.fillStyle = "#fffbf5";
  ctx.textAlign = "center";
  drawCentred(ctx, code, cx, spec.codeY, "x0");

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("could not export the picture"))), "image/jpeg", 0.92);
  });
}
