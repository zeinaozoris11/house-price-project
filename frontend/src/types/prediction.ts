export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom_num: number;
  balcony_num: number;
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  transaction: "New Property" | "Resale";
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}
