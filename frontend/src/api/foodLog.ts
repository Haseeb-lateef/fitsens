import { apiClient } from "./client";
import type { FoodLogCreate, FoodLogOut, FoodLogParseResponse } from "../types/foodLog";

export function getFoodLogs(): Promise<FoodLogOut[]> {
  return apiClient<FoodLogOut[]>("/food-log");
}

export function getFoodLogsForDate(date: string): Promise<FoodLogOut[]> {
  return apiClient<FoodLogOut[]>(`/food-log?date=${date}`);
}

export function parseFoodLog(text: string): Promise<FoodLogParseResponse> {
  return apiClient<FoodLogParseResponse>("/food-log/parse", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function createFoodLog(data: FoodLogCreate): Promise<FoodLogOut> {
  return apiClient<FoodLogOut>("/food-log", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteFoodLog(id: number): Promise<void> {
  return apiClient<void>(`/food-log/${id}`, {
    method: "DELETE",
  });
}
