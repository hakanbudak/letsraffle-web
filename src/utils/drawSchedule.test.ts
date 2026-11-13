import { describe, expect, it } from "vitest";
import { combineLocalDateTime, toLocalDateInput, toLocalHourInput } from "./drawSchedule";

describe("drawSchedule", () => {
  it("combines the selected date and hour in local time", () => {
    const date = combineLocalDateTime("2026-12-20", "16:00");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(20);
    expect(date.getHours()).toBe(16);
    expect(date.getMinutes()).toBe(0);
  });

  it("falls back to midnight when no hour is selected", () => {
    const date = combineLocalDateTime("2026-12-20", "");

    expect(date.getDate()).toBe(20);
    expect(date.getHours()).toBe(0);
  });

  it("round-trips a scheduled moment through the inputs", () => {
    const scheduled = combineLocalDateTime("2026-12-20", "00:00");

    expect(toLocalDateInput(scheduled)).toBe("2026-12-20");
    expect(toLocalHourInput(scheduled)).toBe("00:00");
  });

  it("keeps the local day for an early-morning draw", () => {
    const scheduled = new Date(2026, 11, 20, 1, 0, 0);

    expect(toLocalDateInput(scheduled)).toBe("2026-12-20");
    expect(toLocalHourInput(scheduled)).toBe("01:00");
  });
});
