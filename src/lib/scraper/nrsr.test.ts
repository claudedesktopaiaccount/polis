import { describe, it, expect } from "vitest";
import {
  makeSlug,
  mapTopicCategory,
  mapResult,
  mapChoice,
  parseMpList,
  parseVoteIds,
  parseVoteDetail,
  parseSpeechesList,
  scrapeMps,
  scrapeRecentVotes,
  scrapeRecentSpeeches,
} from "./nrsr";

// ─── makeSlug ─────────────────────────────────────────────

describe("makeSlug", () => {
  it("converts Slovak chars", () => {
    expect(makeSlug("Róbert Fico")).toBe("robert-fico");
    expect(makeSlug("Michal Šimečka")).toBe("michal-simecka");
    expect(makeSlug("Ľudovít Ódor")).toBe("ludovit-odor");
  });

  it("lowercases and collapses spaces", () => {
    expect(makeSlug("Jana  Žitňanská")).toBe("jana-zitnanska");
  });

  it("trims leading/trailing dashes", () => {
    expect(makeSlug("  Fico  ")).toBe("fico");
  });
});

// ─── mapTopicCategory ─────────────────────────────────────

describe("mapTopicCategory", () => {
  it("maps zákon", () => {
    expect(mapTopicCategory("Novela zákona o zdravotníctve")).toBe("zákon");
  });

  it("maps rozpočet", () => {
    expect(mapTopicCategory("Schválenie štátneho rozpočtu")).toBe("rozpočet");
  });

  it("maps personálne via voľba", () => {
    expect(mapTopicCategory("Voľba predsedu NR SR")).toBe("personálne");
  });

  it("defaults to iné", () => {
    expect(mapTopicCategory("Procedurálny návrh")).toBe("iné");
  });
});

// ─── mapResult ────────────────────────────────────────────

describe("mapResult", () => {
  it("maps schválené", () => {
    expect(mapResult("Schválené")).toBe("schválené");
    expect(mapResult("Návrh bol prijatý")).toBe("schválené");
  });

  it("maps zamietnuté", () => {
    expect(mapResult("Zamietnutý")).toBe("zamietnuté");
    expect(mapResult("Neprijatý")).toBe("zamietnuté");
  });

  it("maps odročené", () => {
    expect(mapResult("Odročené")).toBe("odročené");
  });

  it("defaults to neznámy for unknown", () => {
    expect(mapResult("")).toBe("neznámy");
  });
});

// ─── mapChoice ────────────────────────────────────────────

describe("mapChoice", () => {
  it("maps Z → za", () => expect(mapChoice("Z")).toBe("za"));
  it("maps P → proti", () => expect(mapChoice("P")).toBe("proti"));
  it("maps N → zdržal_sa", () => expect(mapChoice("N")).toBe("zdržal_sa"));
  it("maps B → neprítomný", () => expect(mapChoice("B")).toBe("neprítomný"));
  it("maps ? → nehlasoval", () => expect(mapChoice("?")).toBe("nehlasoval"));
  it("maps unknown → nehlasoval", () => expect(mapChoice("X")).toBe("nehlasoval"));
  it("handles lowercase z", () => expect(mapChoice("z")).toBe("za"));
});

// ─── parseMpList ──────────────────────────────────────────

const MP_LIST_HTML = `
<html><body>
<table>
  <tr><th>Meno</th><th>Klub</th><th>Kraj</th></tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=791">Fico Robert</a></td>
    <td>SMER</td>
    <td>Bratislavský kraj</td>
  </tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=802">Šimečka Michal</a></td>
    <td>PS</td>
    <td>Trnavský kraj</td>
  </tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=803">Danko Andrej</a></td>
    <td>SNS</td>
    <td>Nitrianský kraj</td>
  </tr>
</table>
</body></html>
`;

describe("parseMpList", () => {
  it("parses MP names and IDs", () => {
    const result = parseMpList(MP_LIST_HTML);
    expect(result.length).toBeGreaterThanOrEqual(3);

    const fico = result.find((m) => m.nrsrPersonId === "791");
    expect(fico).toBeDefined();
    expect(fico!.nameFull).toBe("Fico Robert");
    expect(fico!.nrsrPersonId).toBe("791");
    expect(fico!.role).toBe("poslanec");
  });

  it("generates slug from nameDisplay", () => {
    const result = parseMpList(MP_LIST_HTML);
    const simecka = result.find((m) => m.nrsrPersonId === "802");
    expect(simecka).toBeDefined();
    // nameDisplay rearranged: "Michal Šimečka" → slug "michal-simecka"
    expect(simecka!.slug).toMatch(/simecka/);
  });

  it("extracts party abbreviation", () => {
    const result = parseMpList(MP_LIST_HTML);
    const fico = result.find((m) => m.nrsrPersonId === "791");
    expect(fico!.partyAbbr).toBe("SMER");
  });

  it("returns empty array for empty HTML", () => {
    expect(parseMpList("<html><body></body></html>")).toEqual([]);
  });
});

// ─── parseVoteIds ─────────────────────────────────────────

const VOTE_LIST_HTML = `
<html><body>
<table>
  <tr>
    <td><a href="/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=51234">Hlasovanie 1</a></td>
  </tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=51235">Hlasovanie 2</a></td>
  </tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=51236">Hlasovanie 3</a></td>
  </tr>
</table>
</body></html>
`;

describe("parseVoteIds", () => {
  it("extracts vote IDs", () => {
    const ids = parseVoteIds(VOTE_LIST_HTML, 10);
    expect(ids).toContain("51234");
    expect(ids).toContain("51235");
    expect(ids).toContain("51236");
  });

  it("respects limit", () => {
    const ids = parseVoteIds(VOTE_LIST_HTML, 2);
    expect(ids.length).toBe(2);
  });

  it("deduplicates IDs", () => {
    const html = `
      <a href="?ID=100">A</a>
      <a href="?ID=100">B</a>
      <a href="?ID=101">C</a>
    `;
    const ids = parseVoteIds(html, 10);
    expect(ids.filter((id) => id === "100").length).toBe(1);
  });
});

// ─── parseVoteDetail ─────────────────────────────────────

const VOTE_DETAIL_HTML = `
<html><body>
<h1>Hlasovanie o návrhu zákona o daniach</h1>
<p>Dátum: 15. 3. 2025</p>
<p>Výsledok: Schválené</p>
<p>Za: 76  Proti: 40  Zdržal: 10  Neprítomní: 24</p>
<table>
  <tr>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=791">Fico Robert</a></td>
    <td>Z</td>
  </tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=802">Šimečka Michal</a></td>
    <td>P</td>
  </tr>
  <tr>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=803">Danko Andrej</a></td>
    <td>N</td>
  </tr>
</table>
</body></html>
`;

describe("parseVoteDetail", () => {
  const sourceUrl = "https://www.nrsr.sk/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=51234";

  it("parses vote metadata", () => {
    const { vote } = parseVoteDetail(VOTE_DETAIL_HTML, "51234", sourceUrl);
    expect(vote).not.toBeNull();
    expect(vote!.nrsrVoteId).toBe("51234");
    expect(vote!.titleSk).toContain("zákon");
    expect(vote!.topicCategory).toBe("zákon");
    expect(vote!.result).toBe("schválené");
    expect(vote!.date).toBe("2025-03-15");
    expect(vote!.sourceUrl).toBe(sourceUrl);
  });

  it("parses vote counts", () => {
    const { vote } = parseVoteDetail(VOTE_DETAIL_HTML, "51234", sourceUrl);
    expect(vote!.votesFor).toBe(76);
    expect(vote!.votesAgainst).toBe(40);
    expect(vote!.votesAbstain).toBe(10);
  });

  it("parses per-MP records with correct choice mapping", () => {
    const { records } = parseVoteDetail(VOTE_DETAIL_HTML, "51234", sourceUrl);
    expect(records.length).toBeGreaterThanOrEqual(3);

    const ficoRecord = records.find((r) => r.nrsrPersonId === "791");
    expect(ficoRecord!.choice).toBe("za");

    const simeckaRecord = records.find((r) => r.nrsrPersonId === "802");
    expect(simeckaRecord!.choice).toBe("proti");

    const dankoRecord = records.find((r) => r.nrsrPersonId === "803");
    expect(dankoRecord!.choice).toBe("zdržal_sa");
  });

  it("all records have correct nrsrVoteId", () => {
    const { records } = parseVoteDetail(VOTE_DETAIL_HTML, "51234", sourceUrl);
    for (const r of records) {
      expect(r.nrsrVoteId).toBe("51234");
    }
  });
});

// ─── parseSpeechesList ────────────────────────────────────

const SPEECHES_HTML = `
<html><body>
<table>
  <tr><th>Dátum</th><th>Poslanec</th><th>Prepis</th></tr>
  <tr>
    <td>15. 3. 2025</td>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=791">Fico Robert</a></td>
    <td><a href="/web/Default.aspx?sid=schodze/stenozaznamy&ID=9001">Prejav o bezpečnosti krajiny a zahraničnej politike vlády</a></td>
  </tr>
  <tr>
    <td>16. 3. 2025</td>
    <td><a href="/web/Default.aspx?sid=poslanci/poslanec&PoslanecID=802">Šimečka Michal</a></td>
    <td><a href="/web/Default.aspx?sid=schodze/stenozaznamy&ID=9002">Opozičný príspevok k návrhu zákona</a></td>
  </tr>
</table>
</body></html>
`;

describe("parseSpeechesList", () => {
  it("parses speeches with nrsrPersonId", () => {
    const result = parseSpeechesList(SPEECHES_HTML, 10);
    expect(result.length).toBeGreaterThanOrEqual(2);

    const ficoSpeech = result.find((s) => s.nrsrPersonId === "791");
    expect(ficoSpeech).toBeDefined();
    expect(ficoSpeech!.nrsrSpeechId).toBe("9001");
    expect(ficoSpeech!.date).toBe("2025-03-15");
  });

  it("extracts speech text", () => {
    const result = parseSpeechesList(SPEECHES_HTML, 10);
    const ficoSpeech = result.find((s) => s.nrsrPersonId === "791");
    expect(ficoSpeech!.textSk).toBeTruthy();
  });

  it("respects limit", () => {
    const result = parseSpeechesList(SPEECHES_HTML, 1);
    expect(result.length).toBe(1);
  });

  it("deduplicates by nrsrSpeechId", () => {
    const result = parseSpeechesList(SPEECHES_HTML, 10);
    const ids = result.map((s) => s.nrsrSpeechId);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });
});

// ─── Fetcher injection (graceful error handling) ──────────

describe("scrapeMps — fetcher injection", () => {
  it("returns parsed MPs from mock fetcher", async () => {
    const fetcher = async (_url: string) => MP_LIST_HTML;
    const result = await scrapeMps(fetcher);
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it("returns empty array on network error", async () => {
    const fetcher = async (_url: string): Promise<string> => {
      throw new Error("network error");
    };
    const result = await scrapeMps(fetcher);
    expect(result).toEqual([]);
  });
});

describe("scrapeRecentVotes — fetcher injection", () => {
  it("returns votes and records from mock fetcher", async () => {
    const fetcher = async (url: string) => {
      if (url.includes("zoznam")) return VOTE_LIST_HTML;
      return VOTE_DETAIL_HTML;
    };
    const { votes, records } = await scrapeRecentVotes(3, fetcher);
    expect(votes.length).toBeGreaterThan(0);
    expect(records.length).toBeGreaterThan(0);
  });

  it("returns empty on network error", async () => {
    const fetcher = async (_url: string): Promise<string> => {
      throw new Error("network error");
    };
    const { votes, records } = await scrapeRecentVotes(10, fetcher);
    expect(votes).toEqual([]);
    expect(records).toEqual([]);
  });
});

describe("scrapeRecentSpeeches — fetcher injection", () => {
  it("returns speeches from mock fetcher", async () => {
    const fetcher = async (_url: string) => SPEECHES_HTML;
    const result = await scrapeRecentSpeeches(10, fetcher);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("returns empty on network error", async () => {
    const fetcher = async (_url: string): Promise<string> => {
      throw new Error("network error");
    };
    const result = await scrapeRecentSpeeches(10, fetcher);
    expect(result).toEqual([]);
  });
});
