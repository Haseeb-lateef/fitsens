import type { WorkoutSetOut } from "../types/workoutSet";

export function maxWeightPerDay(sets: WorkoutSetOut[]): { date: string; weight: number }[] {
  const maxByDate = new Map<string, number>();

  for (const set of sets) {
    const date = set.performed_at.slice(0, 10);
    const currentMax = maxByDate.get(date) ?? 0;
    maxByDate.set(date, Math.max(currentMax, set.weight_kg));
  }

  return Array.from(maxByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, weight]) => ({ date, weight }));
}
