import { useEffect, useState } from "react";
import { getWeekPlan, createPlanEntry, deletePlanEntry } from "../api/plan";
import { getExercises } from "../api/exercises";
import type { WeekPlan, DayOfWeek } from "../types/plan";
import type { ExerciseOut } from "../types/exercise";

const DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function PlanEditor() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [exercises, setExercises] = useState<ExerciseOut[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | "">("");

  useEffect(() => {
    getWeekPlan().then(setWeekPlan);
    getExercises().then(setExercises);
  }, []);

  if (!weekPlan) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  const dayEntries = weekPlan[selectedDay];

  function exerciseName(exerciseId: number) {
    return exercises.find((exercise) => exercise.id === exerciseId)?.name ?? "Unknown exercise";
  }

  async function handleAdd() {
    if (selectedExerciseId === "") return;

    const newEntry = await createPlanEntry(selectedDay, {
      exercise_id: selectedExerciseId,
      display_order: dayEntries.length,
    });

    setWeekPlan((prev) => prev && { ...prev, [selectedDay]: [...prev[selectedDay], newEntry] });
    setSelectedExerciseId("");
  }

  async function handleDelete(id: number) {
    await deletePlanEntry(id);
    setWeekPlan((prev) => prev && { ...prev, [selectedDay]: prev[selectedDay].filter((entry) => entry.id !== id) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-full text-sm capitalize whitespace-nowrap ${
              selectedDay === day ? "bg-brand-500 text-neutral-950 font-semibold" : "bg-neutral-900 text-neutral-400"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 bg-neutral-900 rounded-2xl p-4">
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value === "" ? "" : Number(e.target.value))}
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50"
        >
          <option value="">Select exercise</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
        <button onClick={handleAdd} className="bg-brand-500 text-neutral-950 font-semibold rounded-lg px-4 hover:bg-brand-600 transition-colors">
          Add
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {dayEntries.length === 0 && <p className="text-neutral-400 text-sm">No exercises planned for this day.</p>}
        {dayEntries.map((entry) => (
          <div key={entry.id} className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-neutral-50">{exerciseName(entry.exercise_id)}</p>
            <button onClick={() => handleDelete(entry.id)} className="text-red-500 text-sm">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanEditor;
