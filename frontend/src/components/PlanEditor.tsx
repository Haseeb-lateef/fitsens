import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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
      <div className="flex gap-1 overflow-x-auto bg-neutral-900 rounded-full p-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize whitespace-nowrap transition-colors ${
              selectedDay === day
                ? "bg-brand-500 text-neutral-950 font-semibold"
                : "text-neutral-400 hover:text-neutral-50"
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
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
        {dayEntries.map((entry) => {
          const exercise = exercises.find((ex) => ex.id === entry.exercise_id);
          return (
            <div key={entry.id} className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-neutral-50">{exercise?.name ?? "Unknown exercise"}</p>
                {exercise?.muscle_group && (
                  <p className="text-neutral-400 text-sm">{exercise.muscle_group}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                aria-label="Delete"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlanEditor;
