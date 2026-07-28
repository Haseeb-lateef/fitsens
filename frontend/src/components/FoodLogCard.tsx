import { Trash2 } from "lucide-react";
import type { FoodLogOut } from "../types/foodLog";

interface FoodLogCardProps {
  log: FoodLogOut;
  onDelete: (id: number) => void;
}

// Rendered inside a meal section, so the meal type isn't repeated here.
function FoodLogCard({ log, onDelete }: FoodLogCardProps) {
  return (
    <div className="bg-neutral-800 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-neutral-50 text-sm font-semibold truncate">{log.name}</p>
        <p className="text-neutral-400 text-xs">
          {log.calories} Kcal · P{log.protein_g} C{log.carbs_g} F{log.fat_g}
        </p>
      </div>
      <button
        onClick={() => onDelete(log.id)}
        aria-label={`Delete ${log.name}`}
        className="flex items-center gap-1.5 text-neutral-400 hover:text-red-400 transition-colors shrink-0"
      >
        <Trash2 size={14} className="text-red-500" />
        <span className="text-xs">Delete</span>
      </button>
    </div>
  );
}

export default FoodLogCard;
