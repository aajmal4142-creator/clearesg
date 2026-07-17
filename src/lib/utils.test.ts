import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";
import { houseSpring } from "@/lib/motion";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("houseSpring", () => {
  it("uses the §3 house spring defaults", () => {
    expect(houseSpring).toEqual({
      type: "spring",
      stiffness: 260,
      damping: 30,
    });
  });
});
