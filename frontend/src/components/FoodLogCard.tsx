import type { FoodLogOut } from "../types/foodLog";

interface FoodLogCardProps {
  log: FoodLogOut;
  onDelete: (id: number) => void;
}

function FoodLogCard({ log, onDelete }: FoodLogCardProps) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-neutral-50">{log.name}</p>
        <p className="text-neutral-400 text-sm capitalize">
          {log.meal_type} · {log.calories} kcal · P{log.protein_g} C{log.carbs_g} F{log.fat_g}
        </p>
      </div>
      <button onClick={() => onDelete(log.id)} className="text-red-500 text-sm">
        Delete
      </button>
    </div>
  );
}

export default FoodLogCard;
