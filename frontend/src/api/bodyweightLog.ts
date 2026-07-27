import { apiClient } from "./client";
import type { BodyweightLogCreate, BodyweightLogOut } from "../types/bodyweightLog";

export function getBodyweightLogs(): Promise<BodyweightLogOut[]> {
  return apiClient<BodyweightLogOut[]>("/bodyweight-log");
}

export function createBodyweightLog(data: BodyweightLogCreate): Promise<BodyweightLogOut> {
  return apiClient<BodyweightLogOut>("/bodyweight-log", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteBodyweightLog(id: number): Promise<void> {
  return apiClient<void>(`/bodyweight-log/${id}`, {
    method: "DELETE",
  });
}
