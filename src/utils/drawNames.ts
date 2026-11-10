/**
 * Fun names for draws that have no invite code (manual draws), in the draw's language.
 * Mirrors the backend invite-code word lists (app/utils/link_generator.py) and is
 * deterministic per draw id so a draw keeps its name between visits.
 */
const TR_ADJECTIVES = [
  "neseli", "sakar", "uykucu", "obur", "tombik", "haylaz", "geveze", "telasli",
  "pofuduk", "zipzip", "miskin", "sasirmis", "kikirdayan", "havali", "utangac",
  "cilgin", "dalgin", "sirin", "afacan", "mizmiz", "keyifli",
];
const TR_NOUNS = [
  "rengeyigi", "kardanadam", "noelbaba", "kurabiye", "mandalina", "kestane",
  "salep", "kizak", "yilbasiagaci", "penguen", "hindi", "corap", "zil",
  "yildiz", "hediye", "cuce", "kartopu", "simit", "boza", "pamuk",
];
const EN_ADJECTIVES = [
  "jolly", "merry", "festive", "bright", "shiny", "sparkly", "cheerful", "happy", "cozy",
  "magical", "snowy", "frosty", "gleaming", "twinkling", "radiant", "dazzling", "glowing", "beaming",
];
const EN_NOUNS = [
  "reindeer", "snowman", "gift", "star", "bell", "tree", "santa", "elf", "candy",
  "sleigh", "angel", "wreath", "snowflake", "gingerbread", "stocking", "ornament", "mistletoe", "carol",
];

export function funDrawName(id: number, language?: string): string {
  const tr = (language ?? "TR").toUpperCase() === "TR";
  const adjectives = tr ? TR_ADJECTIVES : EN_ADJECTIVES;
  const nouns = tr ? TR_NOUNS : EN_NOUNS;
  const n = Math.abs(Math.trunc(id)) || 0;
  const adj = adjectives[(n * 7 + 3) % adjectives.length];
  const noun = nouns[(n * 13 + 5) % nouns.length];
  return `${adj}-${noun}-${String(100 + (n * 37) % 900)}`;
}
