export interface Prediction {
  id: number;
  generatedAt: string;
  modelVersion: string;
}

export interface PredictionResult {
  id: number;
  predictionId: number;
  partyId: string;
  predictedPct: number;
  lowerBound: number;
  upperBound: number;
  winProbability: number;
  parliamentProbability: number;
}

export interface PartyPrediction {
  partyId: string;
  predictedPct: number;
  lowerBound: number;
  upperBound: number;
  winProbability: number;
  parliamentProbability: number;
  predictedSeats: number;
}
