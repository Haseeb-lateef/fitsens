import type { ExerciseOut } from "../types/exercise";

interface ExerciseCardProps {
  exercise: ExerciseOut;
  onDelete: (id: number) => void;
}

function ExerciseCard({ exercise, onDelete }: ExerciseCardProps) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-neutral-50">{exercise.name}</p>
        {exercise.muscle_group && <p className="text-neutral-400 text-sm">{exercise.muscle_group}</p>}
      </div>
      <button onClick={() => onDelete(exercise.id)} className="text-red-500 text-sm">
        Delete
      </button>
    </div>
  );
}

export default ExerciseCard;
