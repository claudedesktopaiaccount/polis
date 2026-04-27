import { describe, it, expect } from "vitest";
import { extractPromisesFromProgram } from "./promise-extractor";
import type { ScrapedProgram } from "./programs";

function makeProgram(sections: { heading: string; text: string }[]): ScrapedProgram {
  return {
    partyId: "test",
    sourceUrl: "https://example.sk/program/",
    sourceDate: "2023-09-30",
    title: "Test Program",
    fullText: sections.map((s) => s.text).join("\n\n"),
    sections,
  };
}

describe("extractPromisesFromProgram", () => {
  it("extracts sentences containing promise keywords", () => {
    const program = makeProgram([
      {
        heading: "Hospodárstvo",
        text: "Zavedieme nové opatrenia na podporu malých a stredných podnikov. Toto je bežná veta bez kľúčového slova.",
      },
    ]);

    const promises = extractPromisesFromProgram(program);
    expect(promises.length).toBe(1);
    expect(promises[0].textSk).toContain("Zavedieme");
    expect(promises[0].partyId).toBe("test");
    expect(promises[0].sourceUrl).toBe("https://example.sk/program/");
    expect(promises[0].aiConfidence).toBe(0.6);
  });

  it("filters out sentences shorter than 30 chars", () => {
    const program = makeProgram([
      {
        heading: "Test",
        text: "Zavedieme X.\nZnížime veľmi veľmi veľmi dlhý text o ďalšom konkrétnom opatrení vlády.",
      },
    ]);
    const promises = extractPromisesFromProgram(program);
    // "Zavedieme X." is 13 chars — filtered
    expect(promises.every((p) => p.textSk.length >= 30)).toBe(true);
  });

  it("filters out sentences longer than 500 chars", () => {
    const longSentence = "Zavedieme " + "a".repeat(500);
    const program = makeProgram([
      {
        heading: "Test",
        text: longSentence,
      },
    ]);
    const promises = extractPromisesFromProgram(program);
    expect(promises.length).toBe(0);
  });

  it("deduplicates identical sentences", () => {
    const sentence = "Zavedieme nové opatrenia na podporu malých a stredných podnikov v krajine.";
    const program = makeProgram([
      { heading: "Sekcia 1", text: sentence },
      { heading: "Sekcia 2", text: sentence },
    ]);
    const promises = extractPromisesFromProgram(program);
    expect(promises.length).toBe(1);
  });

  it("deduplicates by first 100 chars of normalized text", () => {
    const base = "Zavedieme opatrenia na podporu malých a stredných podnikov v celej Slovenskej republike a okolitých";
    const program = makeProgram([
      { heading: "S1", text: `${base} regiónoch.` },
      { heading: "S2", text: `${base} oblastiach.` },
    ]);
    const promises = extractPromisesFromProgram(program);
    // Both start with same 100 chars → deduplicated
    expect(promises.length).toBe(1);
  });

  it("returns empty array for program with no matching keywords", () => {
    const program = makeProgram([
      {
        heading: "O nás",
        text: "Sme politická strana. Máme veľa členov. Pracujeme pre ľudí.",
      },
    ]);
    const promises = extractPromisesFromProgram(program);
    expect(promises.length).toBe(0);
  });

  it("sets aiConfidence to 0.6 for all heuristic results", () => {
    const program = makeProgram([
      {
        heading: "Plány",
        text: "Zavedieme reformu zdravotníctva. Zvýšime platy zdravotníkov. Vybudujeme nové nemocnice v krajských mestách.",
      },
    ]);
    const promises = extractPromisesFromProgram(program);
    expect(promises.every((p) => p.aiConfidence === 0.6)).toBe(true);
  });

  it("handles multiple keywords in different sections", () => {
    const program = makeProgram([
      { heading: "Ekonomika", text: "Znížime dane pre fyzické osoby s nízkymi príjmami po celom Slovensku." },
      { heading: "Školstvo", text: "Investujeme do vzdelávania a zvýšime platy učiteľov na školách." },
      { heading: "Zdravie", text: "Vybudujeme modernú infraštruktúru pre zdravotníctvo v regiónoch Slovenska." },
    ]);
    const promises = extractPromisesFromProgram(program);
    expect(promises.length).toBeGreaterThanOrEqual(3);
  });
});
