import { apiClient } from "./client";
import type { GoalUpdate, GoalOut } from "../types/goal";

export function getGoals(): Promise<GoalOut> {
  return apiClient<GoalOut>("/goals");
}

export function updateGoals(data: GoalUpdate): Promise<GoalOut> {
  return apiClient<GoalOut>("/goals", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
