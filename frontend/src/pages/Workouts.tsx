import { useEffect, useState } from "react";
import { getExercises, createExercise, deleteExercise } from "../api/exercises";
import type { ExerciseOut } from "../types/exercise";
import ExerciseCard from "../components/ExerciseCard";

function Workouts() {
  const [exercises, setExercises] = useState<ExerciseOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const newExercise = await createExercise({ name, muscle_group: muscleGroup || null });
      setExercises((prev) => [...prev, newExercise]);
      setName("");
      setMuscleGroup("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add exercise");
    }
  }

  async function handleDelete(id: number) {
    await deleteExercise(id);
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-400">Loading...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-50">Exercises</h1>

      <form onSubmit={handleAddExercise} className="flex flex-col gap-2 bg-neutral-900 rounded-2xl p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          placeholder="Muscle group (optional)"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 transition-colors">
          Add Exercise
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default Workouts;
