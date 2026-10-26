import { describe, expect, it } from "vitest";
import { completionRate } from "../src/utils/progress.js";

describe("completionRate", () => {
  it("returns a percentage rounded to an integer", () => {
    expect(completionRate(2, 3)).toBe(67);
  });

  it("returns zero when a course has no assignments", () => {
    expect(completionRate(0, 0)).toBe(0);
  });

  it("returns 100 when all assignments are complete", () => {
    expect(completionRate(5, 5)).toBe(100);
  });
});
