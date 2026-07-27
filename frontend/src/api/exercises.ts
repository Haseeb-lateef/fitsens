import { apiClient } from "./client";
import type { ExerciseCreate, ExerciseUpdate, ExerciseOut } from "../types/exercise";

export function getExercises(): Promise<ExerciseOut[]> {
  return apiClient<ExerciseOut[]>("/exercises");
}

export function createExercise(data: ExerciseCreate): Promise<ExerciseOut> {
  return apiClient<ExerciseOut>("/exercises", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateExercise(id: number, data: ExerciseUpdate): Promise<ExerciseOut> {
  return apiClient<ExerciseOut>(`/exercises/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteExercise(id: number): Promise<void> {
  return apiClient<void>(`/exercises/${id}`, {
    method: "DELETE",
  });
}
