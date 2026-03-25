export interface PollSummary {
  agency: string;
  publishedDate: string;
  results: Record<string, number>;
}

const PARTY_NAMES: Record<string, string> = {
  ps: "Progresívne Slovensko",
  "smer-sd": "SMER-SD",
  "hlas-sd": "HLAS-SD",
  kdh: "KDH",
  sas: "SaS",
  demokrati: "Demokrati",
  sns: "SNS",
  republika: "Republika",
  aliancia: "Aliancia",
  slovensko: "Slovensko",
};

export function buildDigestHtml(polls: PollSummary[], siteUrl: string): string {
  const pollRows = polls
    .slice(0, 5)
    .map(
      (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #D6D5CF">${p.agency}</td>
        <td style="padding:8px;border-bottom:1px solid #D6D5CF">${p.publishedDate}</td>
        <td style="padding:8px;border-bottom:1px solid #D6D5CF">
          ${Object.entries(p.results)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([id, pct]) => `${PARTY_NAMES[id] ?? id}: <strong>${pct}%</strong>`)
            .join(" &nbsp;|&nbsp; ")}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="utf-8"><title>Polis Týždenník</title></head>
<body style="font-family:Georgia,serif;background:#F4F3EE;color:#111110;margin:0;padding:0">
  <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #D6D5CF;padding:40px">
    <h1 style="font-size:24px;margin:0 0 8px">Polis Týždenník</h1>
    <p style="color:#666;margin:0 0 32px;font-size:13px">Prehľad politického diania za uplynulý týždeň</p>
    <h2 style="font-size:16px;border-bottom:3px solid #111;padding-bottom:8px">Najnovšie prieskumy</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:32px">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;background:#F4F3EE">Agentúra</th>
          <th style="text-align:left;padding:8px;background:#F4F3EE">Dátum</th>
          <th style="text-align:left;padding:8px;background:#F4F3EE">Výsledky</th>
        </tr>
      </thead>
      <tbody>${pollRows}</tbody>
    </table>
    <p style="font-size:13px">
      <a href="${siteUrl}/prieskumy" style="color:#111;font-weight:bold">Zobraziť všetky prieskumy →</a>
    </p>
    <hr style="border:none;border-top:1px solid #D6D5CF;margin:32px 0">
    <p style="font-size:11px;color:#999">
      Dostávate tento email, pretože ste sa prihlásili na odber na <a href="${siteUrl}" style="color:#999">polis.sk</a>.<br>
      <a href="{{UNSUB_URL}}" style="color:#999">Odhlásiť sa z odberu</a>
    </p>
  </div>
</body>
</html>`;
}

export function buildDigestText(polls: PollSummary[], siteUrl: string): string {
  const lines = [
    "POLIS TÝŽDENNÍK",
    "================",
    "",
    "Najnovšie prieskumy:",
    "",
    ...polls.slice(0, 5).map((p) => {
      const top = Object.entries(p.results)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([id, pct]) => `${PARTY_NAMES[id] ?? id}: ${pct}%`)
        .join(", ");
      return `${p.agency} (${p.publishedDate}): ${top}`;
    }),
    "",
    `Všetky prieskumy: ${siteUrl}/prieskumy`,
    "",
    "---",
    "Odhlásiť sa: {{UNSUB_URL}}",
  ];
  return lines.join("\n");
}
