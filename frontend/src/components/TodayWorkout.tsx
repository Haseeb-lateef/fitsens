import { useEffect, useState } from "react";
import { getDayPlan } from "../api/plan";
import { getExercises } from "../api/exercises";
import type { PlannedExerciseOut, DayOfWeek } from "../types/plan";
import type { ExerciseOut } from "../types/exercise";
import ActiveExerciseCard from "./ActiveExerciseCard";

const DAYS_BY_JS_INDEX: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function TodayWorkout() {
  const [plan, setPlan] = useState<PlannedExerciseOut[] | null>(null);
  const [exercises, setExercises] = useState<ExerciseOut[]>([]);

  const today = DAYS_BY_JS_INDEX[new Date().getDay()];

  useEffect(() => {
    getDayPlan(today).then(setPlan);
    getExercises().then(setExercises);
  }, [today]);

  if (!plan) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  function exerciseName(exerciseId: number) {
    return exercises.find((exercise) => exercise.id === exerciseId)?.name ?? "Unknown exercise";
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-neutral-400 text-sm capitalize">{today}</p>

      {plan.length === 0 && <p className="text-neutral-400 text-sm">No exercises planned for today.</p>}

      {plan.map((entry) => (
        <ActiveExerciseCard key={entry.id} exerciseId={entry.exercise_id} exerciseName={exerciseName(entry.exercise_id)} />
      ))}
    </div>
  );
}

export default TodayWorkout;
