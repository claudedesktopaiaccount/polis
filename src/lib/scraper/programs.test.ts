import { describe, it, expect, vi } from "vitest";
import { scrapePartyPrograms } from "./programs";

const MOCK_HTML_FULL = `
<html>
<body>
<header>Header nav</header>
<nav>Navigation</nav>
<main>
  <h1>Program strany TEST</h1>
  <h2>Hospodárstvo</h2>
  <p>Zavedieme nové opatrenia na podporu malých a stredných podnikov v celej krajine.</p>
  <p>Znížime dane pre fyzické osoby s nízkymi príjmami.</p>
  <h2>Zdravotníctvo</h2>
  <p>Zvýšime platy zdravotníkov o dvadsať percent v priebehu dvoch rokov.</p>
  <p>Vybudujeme nové nemocnice v každom krajskom meste Slovenska.</p>
  <h3>Prevencia</h3>
  <p>Investujeme do prevencie chronických chorôb a zdravého životného štýlu.</p>
</main>
<footer>Footer content</footer>
</body>
</html>
`;

const MOCK_HTML_SHORT = `
<html><body><main><p>Krátky text.</p></main></body></html>
`;

describe("scrapePartyPrograms", () => {
  it("extracts sections from h2/h3 headings", async () => {
    const mockFetcher = vi.fn().mockResolvedValue(MOCK_HTML_FULL);

    const results = await scrapePartyPrograms(mockFetcher);

    // Should have results for each party (6 parties) — all using same mock
    expect(results.length).toBe(6);

    const first = results[0];
    expect(first.partyId).toBe("smer");
    expect(first.title).toBe("Program strany TEST");
    expect(first.sections.length).toBeGreaterThanOrEqual(2);

    const hospSection = first.sections.find((s) => s.heading === "Hospodárstvo");
    expect(hospSection).toBeDefined();
    expect(hospSection!.text).toContain("Zavedieme nové opatrenia");
    expect(hospSection!.text).toContain("Znížime dane");
  });

  it("strips nav/header/footer from extracted text", async () => {
    const mockFetcher = vi.fn().mockResolvedValue(MOCK_HTML_FULL);
    const results = await scrapePartyPrograms(mockFetcher);

    expect(results[0].fullText).not.toContain("Header nav");
    expect(results[0].fullText).not.toContain("Navigation");
    expect(results[0].fullText).not.toContain("Footer content");
  });

  it("filters programs shorter than 200 chars", async () => {
    const mockFetcher = vi.fn().mockResolvedValue(MOCK_HTML_SHORT);
    const results = await scrapePartyPrograms(mockFetcher);
    expect(results.length).toBe(0);
  });

  it("skips failed fetches gracefully and continues with rest", async () => {
    const mockFetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("strana-smer") || url.includes("smer")) throw new Error("Network error");
      return MOCK_HTML_FULL;
    });

    const results = await scrapePartyPrograms(mockFetcher);
    expect(results.length).toBe(5);
    expect(results.every(r => r.partyId !== "smer")).toBe(true);
    expect(results[0].partyId).toBe("ps");
  });

  it("uses injected fetcher instead of global fetch", async () => {
    const mockFetcher = vi.fn().mockResolvedValue(MOCK_HTML_FULL);
    await scrapePartyPrograms(mockFetcher);
    expect(mockFetcher).toHaveBeenCalledTimes(6);
  });

  it("fullText joins all section texts", async () => {
    const mockFetcher = vi.fn().mockResolvedValue(MOCK_HTML_FULL);
    const results = await scrapePartyPrograms(mockFetcher);
    const { fullText, sections } = results[0];

    for (const section of sections) {
      expect(fullText).toContain(section.text);
    }
  });
});
