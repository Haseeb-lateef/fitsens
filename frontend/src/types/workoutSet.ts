export interface WorkoutSetCreate {
  exercise_id: number;
  weight_kg: number;
  reps: number;
}

export interface WorkoutSetOut {
  id: number;
  exercise_id: number;
  weight_kg: number;
  reps: number;
  performed_at: string;
}

export interface LastSessionSet {
  weight_kg: number;
  reps: number;
}
