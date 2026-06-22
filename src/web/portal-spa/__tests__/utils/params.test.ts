import { describe, expect, it } from "vitest";
import { buildPromSeriesQuery } from "@common/lib/helpers/params";

describe("buildPromSeriesQuery", () => {
  it("should return empty string if no params provided", () => {
    const result = buildPromSeriesQuery({});
    expect(result).toBe("");
  });

  it("should build query with match[] only", () => {
    const result = buildPromSeriesQuery({
      match: ["up", "http_requests_total"],
    });
    expect(result).toBe("?match[]=up&match[]=http_requests_total");
  });

  it("should build query with start and end only", () => {
    const result = buildPromSeriesQuery({ start: 1690000000, end: 1690003600 });
    expect(result).toBe("?start=1690000000&end=1690003600");
  });

  it("should build query with match[], start and end", () => {
    const result = buildPromSeriesQuery({
      match: ["up"],
      start: 1690000000,
      end: 1690003600,
    });
    expect(result).toBe("?match[]=up&start=1690000000&end=1690003600");
  });

  it("should ignore empty match array", () => {
    const result = buildPromSeriesQuery({ match: [], start: 1690000000 });
    expect(result).toBe("?start=1690000000");
  });
});
