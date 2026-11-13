import { describe, expect, it } from "vitest";
import { parseInviteCode } from "./inviteCode";

describe("parseInviteCode", () => {
  it("keeps a clean code as it is", () => {
    expect(parseInviteCode("miskin-penguen-53")).toBe("miskin-penguen-53");
  });

  it("forgives case, spaces and Turkish letters", () => {
    expect(parseInviteCode("  Miskin Penguen 53 ")).toBe("miskin-penguen-53");
    expect(parseInviteCode("ŞAŞIRMIŞ-ÇORAP-120")).toBe("sasirmis-corap-120");
    expect(parseInviteCode("jolly_reindeer_742")).toBe("jolly-reindeer-742");
  });

  it("takes the code out of a pasted invite link", () => {
    expect(parseInviteCode("https://letsraffle.co/draw/join/miskin-penguen-53")).toBe("miskin-penguen-53");
    expect(parseInviteCode("letsraffle.co/draw/join/miskin-penguen-53/?utm=x#top")).toBe("miskin-penguen-53");
  });

  it("returns an empty string when there is no usable code", () => {
    expect(parseInviteCode("")).toBe("");
    expect(parseInviteCode("   ")).toBe("");
    expect(parseInviteCode("ab")).toBe("");
    expect(parseInviteCode("kod!?")).toBe("");
  });
});
