import { describe, it, expect } from "vitest";
import * as cheerio from "cheerio";
import {
  buildColumnMap,
  resolvePartyId,
  parsePercentage,
  parseWikiDate,
} from "./wikipedia";

// Helper to create a cheerio table for buildColumnMap tests
function makeTable(html: string) {
  const $ = cheerio.load(`<table class="wikitable">${html}</table>`);
  return { $, table: $("table") };
}

describe("resolvePartyId", () => {
  it("matches direct keys", () => {
    expect(resolvePartyId("smer")).toBe("smer-sd");
    expect(resolvePartyId("PS")).toBe("ps");
    expect(resolvePartyId("KDH")).toBe("kdh");
  });

  it("strips bracket annotations", () => {
    expect(resolvePartyId("Progressive Slovakia [1]")).toBe("ps");
  });

  it("strips parentheticals", () => {
    expect(resolvePartyId("Hlas (SD)")).toBe("hlas-sd");
  });

  it("returns null for unknown party", () => {
    expect(resolvePartyId("Random Party XYZ")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(resolvePartyId("")).toBeNull();
  });

  it("handles unicode dash in Smer–SD", () => {
    expect(resolvePartyId("Smer–SD")).toBe("smer-sd");
  });
});

describe("parsePercentage", () => {
  it("parses standard percentage", () => {
    expect(parsePercentage("23.5%")).toBe(23.5);
  });

  it("parses comma decimal", () => {
    expect(parsePercentage("23,5")).toBe(23.5);
  });

  it("returns null for zero", () => {
    expect(parsePercentage("0")).toBeNull();
  });

  it("returns null for 100", () => {
    expect(parsePercentage("100")).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(parsePercentage("N/A")).toBeNull();
    expect(parsePercentage("–")).toBeNull();
  });

  it("rounds to 1 decimal place", () => {
    expect(parsePercentage("12.34")).toBe(12.3);
  });
});

describe("parseWikiDate", () => {
  it("parses standard date", () => {
    expect(parseWikiDate("15 March 2026")).toBe("2026-03-15");
  });

  it("parses date range (takes end date)", () => {
    expect(parseWikiDate("12-15 March 2026")).toBe("2026-03-15");
  });

  it("returns null for invalid month", () => {
    expect(parseWikiDate("15 Foobar 2026")).toBeNull();
  });

  it("zero-pads single digit day", () => {
    expect(parseWikiDate("5 Jan 2026")).toBe("2026-01-05");
  });

  it("handles extra whitespace", () => {
    expect(parseWikiDate("  15   March   2026  ")).toBe("2026-03-15");
  });
});

describe("buildColumnMap", () => {
  it("maps simple header row to parties", () => {
    const { $, table } = makeTable(`
      <tr><th>Polling firm</th><th>Date</th><th>Sample</th><th>PS</th><th>Smer</th><th>KDH</th></tr>
      <tr><td>Agency</td><td>15 March 2026</td><td>1000</td><td>25</td><td>22</td><td>8</td></tr>
    `);
    const result = buildColumnMap($, table);
    expect(result.columnMap.get(3)).toBe("ps");
    expect(result.columnMap.get(4)).toBe("smer-sd");
    expect(result.columnMap.get(5)).toBe("kdh");
    expect(result.agencyCol).toBe(0);
    expect(result.dateCol).toBe(1);
    expect(result.sampleCol).toBe(2);
  });

  it("handles colspan — multiple columns map to same party", () => {
    const { $, table } = makeTable(`
      <tr>
        <th>Polling firm</th><th>Date</th><th>Sample</th>
        <th colspan="3">OĽaNO and Friends</th>
        <th>Smer</th>
      </tr>
      <tr><td>A</td><td>1 Jan 2026</td><td>1000</td><td>5</td><td>3</td><td>2</td><td>22</td></tr>
    `);
    const result = buildColumnMap($, table);
    // All 3 colspan columns should map to slovensko (OĽaNO → slovensko)
    expect(result.columnMap.get(3)).toBe("slovensko");
    expect(result.columnMap.get(4)).toBe("slovensko");
    expect(result.columnMap.get(5)).toBe("slovensko");
    expect(result.columnMap.get(6)).toBe("smer-sd");
  });

  it("handles rowspan — cell spans multiple rows", () => {
    const { $, table } = makeTable(`
      <tr><th>Polling firm</th><th>Date</th><th>Sample</th><th rowspan="2">PS</th><th rowspan="2">Smer</th></tr>
      <tr><th colspan="3">Sub-header row</th></tr>
      <tr><td>Agency</td><td>1 Jan 2026</td><td>1000</td><td>25</td><td>22</td></tr>
    `);
    const result = buildColumnMap($, table);
    expect(result.columnMap.get(3)).toBe("ps");
    expect(result.columnMap.get(4)).toBe("smer-sd");
  });

  it("skips Lead and Others columns", () => {
    const { $, table } = makeTable(`
      <tr><th>Polling firm</th><th>Date</th><th>Sample</th><th>PS</th><th>Lead</th><th>Others</th></tr>
    `);
    const result = buildColumnMap($, table);
    expect(result.columnMap.get(3)).toBe("ps");
    expect(result.columnMap.has(4)).toBe(false);
    expect(result.columnMap.has(5)).toBe(false);
  });

  it("returns empty columnMap for unknown headers", () => {
    const { $, table } = makeTable(`
      <tr><th>Polling firm</th><th>Date</th><th>Sample</th><th>Unknown1</th><th>Unknown2</th></tr>
    `);
    const result = buildColumnMap($, table);
    expect(result.columnMap.size).toBe(0);
  });

  it("counts header rows correctly", () => {
    const { $, table } = makeTable(`
      <tr><th>Polling firm</th><th>Date</th><th>Sample</th><th>PS</th></tr>
      <tr><th>Sub</th><th>Sub</th><th>Sub</th><th>Sub</th></tr>
      <tr><td>Agency</td><td>1 Jan 2026</td><td>1000</td><td>25</td></tr>
    `);
    const result = buildColumnMap($, table);
    expect(result.headerRowCount).toBe(2);
  });
});
