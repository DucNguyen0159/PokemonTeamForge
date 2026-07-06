import { describe, expect, it } from "vitest";

import { CHAMPIONS_BUILDER_PLANS_HREF } from "@/data/champions";
import {
  builderTabQueryValue,
  parseBuilderTab,
} from "@/lib/champions/builder-tabs";

describe("plans redirect target", () => {
  it("points to builder plans tab", () => {
    expect(CHAMPIONS_BUILDER_PLANS_HREF).toBe("/champions/builder?tab=plans");
  });
});

describe("parseBuilderTab", () => {
  it("defaults to roster", () => {
    expect(parseBuilderTab(null)).toBe("roster");
    expect(parseBuilderTab("")).toBe("roster");
    expect(parseBuilderTab("unknown")).toBe("roster");
  });

  it("parses plans and settings", () => {
    expect(parseBuilderTab("plans")).toBe("plans");
    expect(parseBuilderTab("settings")).toBe("settings");
  });
});

describe("builderTabQueryValue", () => {
  it("omits roster from query string", () => {
    expect(builderTabQueryValue("roster")).toBeNull();
  });

  it("returns tab param for non-roster tabs", () => {
    expect(builderTabQueryValue("plans")).toBe("plans");
    expect(builderTabQueryValue("settings")).toBe("settings");
  });
});
