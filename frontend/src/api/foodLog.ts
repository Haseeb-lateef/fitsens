import { apiClient } from "./client";
import type { FoodLogCreate, FoodLogOut } from "../types/foodLog";

export function getFoodLogs(): Promise<FoodLogOut[]> {
  return apiClient<FoodLogOut[]>("/food-log");
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
