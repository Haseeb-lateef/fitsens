import { apiClient } from "./client";
import type { DayOfWeek, PlannedExerciseCreate, PlannedExerciseOut, WeekPlan } from "../types/plan";

export function getWeekPlan(): Promise<WeekPlan> {
  return apiClient<WeekPlan>("/plan");
}

export function createPlanEntry(day: DayOfWeek, data: PlannedExerciseCreate): Promise<PlannedExerciseOut> {
  return apiClient<PlannedExerciseOut>(`/plan/${day}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePlanEntry(id: number): Promise<void> {
  return apiClient<void>(`/plan/${id}`, {
    method: "DELETE",
  });
}
