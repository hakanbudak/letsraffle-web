/**
 * Invite codes look like "miskin-penguen-53": lower-case ASCII words and a number, joined by dashes.
 * People type them from a poster or paste the whole invite link, so the input is cleaned up first.
 */
const TURKISH_LETTERS: Record<string, string> = { ş: "s", ç: "c", ğ: "g", ı: "i", ö: "o", ü: "u" };

/** Returns the invite code found in what the user typed or pasted, or "" when there is none. */
export function parseInviteCode(input: string): string {
  let value = input.trim();
  if (!value) return "";

  // a pasted invite link: keep the last path segment
  if (value.includes("/")) {
    value = value.split(/[?#]/)[0].replace(/\/+$/, "");
    value = value.slice(value.lastIndexOf("/") + 1);
  }

  value = value
    .toLocaleLowerCase("tr")
    .replace(/[şçğıöü]/g, (letter) => TURKISH_LETTERS[letter])
    .replace(/[\s_.–—]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return /^[a-z0-9-]{3,64}$/.test(value) ? value : "";
}
