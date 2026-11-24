import { describe, expect, it } from "vitest";
import { homeContent } from "./home";

describe("home content", () => {
  it("has the same shape in both languages", () => {
    const { tr, en } = homeContent;
    expect(en.steps).toHaveLength(tr.steps.length);
    expect(en.modes).toHaveLength(tr.modes.length);
    expect(en.faq).toHaveLength(tr.faq.length);
  });

  it("states the participant limits the API enforces", () => {
    expect(homeContent.tr.faq.map((f) => f.a).join(" ")).toContain("En az 3, en fazla 200");
    expect(homeContent.en.faq.map((f) => f.a).join(" ")).toContain("From 3 to 200");
  });
});
