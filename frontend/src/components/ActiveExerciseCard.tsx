import { useEffect, useState } from "react";
import { createWorkoutSet, getLastSession } from "../api/workoutSets";
import type { LastSessionSet, WorkoutSetOut } from "../types/workoutSet";

interface ActiveExerciseCardProps {
  exerciseId: number;
  exerciseName: string;
}

function ActiveExerciseCard({ exerciseId, exerciseName }: ActiveExerciseCardProps) {
  const [lastSession, setLastSession] = useState<LastSessionSet[]>([]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loggedSets, setLoggedSets] = useState<WorkoutSetOut[]>([]);

  useEffect(() => {
    getLastSession(exerciseId).then(setLastSession);
  }, [exerciseId]);

  async function handleLogSet() {
    if (weight === "" || reps === "") return;

    const newSet = await createWorkoutSet({
      exercise_id: exerciseId,
      weight_kg: Number(weight),
      reps: Number(reps),
    });

    setLoggedSets((prev) => [...prev, newSet]);
  }

  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-neutral-50 font-semibold">{exerciseName}</p>

      {lastSession.length > 0 && (
        <p className="text-neutral-400 text-sm">
          Last time: {lastSession.map((set) => `${set.weight_kg}kg × ${set.reps}`).join(", ")}
        </p>
      )}

      {loggedSets.map((set, index) => (
        <p key={set.id} className="text-brand-500 text-sm">
          Set {index + 1}: {set.weight_kg}kg × {set.reps}
        </p>
      ))}

      <div className="flex gap-2">
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg"
          inputMode="decimal"
          className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="reps"
          inputMode="numeric"
          className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleLogSet}
          className="flex-1 bg-brand-500 text-neutral-950 font-semibold rounded-lg hover:bg-brand-600 transition-colors"
        >
          Log Set
        </button>
      </div>
    </div>
  );
}

export default ActiveExerciseCard;
