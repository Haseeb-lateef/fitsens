export interface GoalUpdate {
  daily_calorie_target?: number | null;
  protein_target_g?: number | null;
  goal_weight_kg?: number | null;
}

export interface GoalOut {
  daily_calorie_target: number | null;
  protein_target_g: number | null;
  goal_weight_kg: number | null;
  updated_at: string;
}
