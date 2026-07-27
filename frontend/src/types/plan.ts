export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface PlannedExerciseCreate {
  exercise_id: number;
  display_order: number;
}

export interface PlannedExerciseUpdate {
  exercise_id?: number;
  display_order?: number;
}

export interface PlannedExerciseOut {
  id: number;
  day_of_week: DayOfWeek;
  exercise_id: number;
  display_order: number;
}

export type WeekPlan = Record<DayOfWeek, PlannedExerciseOut[]>;
