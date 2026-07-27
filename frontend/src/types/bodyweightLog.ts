export interface BodyweightLogCreate {
  weight_kg: number;
}

export interface BodyweightLogOut {
  id: number;
  weight_kg: number;
  logged_at: string;
}
