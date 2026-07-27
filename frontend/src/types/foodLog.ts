export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLogCreate {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: MealType;
}

export interface FoodLogParseResponse {
  name: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_type: MealType | null;
}

export interface FoodLogOut {
  id: number;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: MealType;
  logged_at: string;
}
