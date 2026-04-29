function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface QuizCardProps {
  topParty: string;
  topScore: number;
  partyColor: string;
}

export function generateQuizCard({ topParty, topScore, partyColor }: QuizCardProps): string {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F4F3EE"/>
  <rect x="0" y="0" width="1200" height="8" fill="${escapeHtml(partyColor)}"/>
  <text x="60" y="100" font-family="Georgia, serif" font-size="24" fill="#111110" opacity="0.4">VOLÍMTO ·VOLEBNÝ KALKULÁTOR</text>
  <text x="60" y="200" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#111110">Moja najväčšia zhoda:</text>
  <text x="60" y="300" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="${escapeHtml(partyColor)}">${escapeHtml(topParty)}</text>
  <text x="60" y="380" font-family="monospace" font-size="48" fill="#111110">${topScore}%</text>
  <text x="60" y="560" font-family="system-ui" font-size="20" fill="#111110" opacity="0.4">volimto.sk/volebny-kalkulator</text>
</svg>`;
}

interface ScoreCardProps {
  score: number;
  rank: number;
  totalUsers: number;
}

export function generateScoreCard({ score, rank, totalUsers }: ScoreCardProps): string {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F4F3EE"/>
  <rect x="0" y="0" width="1200" height="8" fill="#111110"/>
  <text x="60" y="100" font-family="Georgia, serif" font-size="24" fill="#111110" opacity="0.4">VOLÍMTO ·PREDIKCIA VOLIEB</text>
  <text x="60" y="240" font-family="monospace" font-size="120" font-weight="bold" fill="#111110">${score}</text>
  <text x="60" y="300" font-family="Georgia, serif" font-size="36" fill="#111110">bodov</text>
  <text x="60" y="400" font-family="monospace" font-size="48" fill="#111110" opacity="0.6">#${rank} z ${totalUsers.toLocaleString("sk-SK")}</text>
  <text x="60" y="560" font-family="system-ui" font-size="20" fill="#111110" opacity="0.4">volimto.sk/tipovanie</text>
</svg>`;
}
