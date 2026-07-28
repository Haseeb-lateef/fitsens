export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface PlannedExerciseCreate {
  exercise_id: number;
  display_order: number;
  target_sets?: number | null;
  target_reps?: number | null;
}

export interface PlannedExerciseUpdate {
  exercise_id?: number;
  display_order?: number;
  target_sets?: number | null;
  target_reps?: number | null;
}

export interface PlannedExerciseOut {
  id: number;
  day_of_week: DayOfWeek;
  exercise_id: number;
  display_order: number;
  target_sets: number | null;
  target_reps: number | null;
}

export type WeekPlan = Record<DayOfWeek, PlannedExerciseOut[]>;
