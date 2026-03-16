export type { Party } from "@/lib/parties";

export interface PartyPromise {
  id: number;
  partyId: string;
  promiseText: string;
  category: string;
  isPro: boolean;
  sourceUrl?: string;
}

export interface CoalitionScenario {
  id: number;
  name: string;
  partyIds: string[];
  combinedProbability: number;
  predictedSeats: number;
  predictionId: number;
}
