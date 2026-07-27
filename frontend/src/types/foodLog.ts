export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLogCreate {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: MealType;
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
