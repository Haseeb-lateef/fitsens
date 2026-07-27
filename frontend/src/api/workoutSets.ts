import { apiClient } from "./client";
import type { WorkoutSetCreate, WorkoutSetOut, LastSessionSet } from "../types/workoutSet";

export function createWorkoutSet(data: WorkoutSetCreate): Promise<WorkoutSetOut> {
  return apiClient<WorkoutSetOut>("/workout-sets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getWorkoutSets(exerciseId: number): Promise<WorkoutSetOut[]> {
  return apiClient<WorkoutSetOut[]>(`/workout-sets?exercise_id=${exerciseId}`);
}

export function getLastSession(exerciseId: number): Promise<LastSessionSet[]> {
  return apiClient<LastSessionSet[]>(`/exercises/${exerciseId}/last-session`);
}
