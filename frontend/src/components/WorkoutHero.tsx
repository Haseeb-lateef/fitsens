import { Check } from "lucide-react";
import type { LastSessionSet } from "../types/workoutSet";

interface WorkoutHeroProps {
  name: string;
  suggested: number;
  loggedCount: number;
  lastSession: LastSessionSet[];
  weight: string;
  reps: string;
  isLogging: boolean;
  canGoPrevious: boolean;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onLog: () => void;
  onUndoLastSet: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

function WorkoutHero({
  name,
  suggested,
  loggedCount,
  lastSession,
  weight,
  reps,
  isLogging,
  canGoPrevious,
  onWeightChange,
  onRepsChange,
  onLog,
  onUndoLastSet,
  onPrevious,
  onNext,
}: WorkoutHeroProps) {
  const currentSetNumber = loggedCount + 1;
  const tileCount = Math.max(suggested, loggedCount);
  const setLabel =
    currentSetNumber <= suggested ? `Set ${currentSetNumber} of ${suggested}` : `Set ${currentSetNumber}`;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 border border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl font-bold text-neutral-50">{name}</p>
        <span className="text-brand-500 text-sm font-semibold whitespace-nowrap">{setLabel}</span>
      </div>

      <p className="text-neutral-400 text-sm">
        {lastSession.length > 0
          ? `Last: ${lastSession.map((set) => `${set.weight_kg}kg × ${set.reps}`).join(", ")}`
          : "First time — no history yet"}
      </p>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: tileCount }).map((_, i) =>
          i < loggedCount ? (
            <div
              key={i}
              className="w-9 h-9 rounded-lg bg-brand-500 text-neutral-950 flex items-center justify-center"
            >
              <Check size={18} />
            </div>
          ) : (
            <div
              key={i}
              className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center text-sm font-medium"
            >
              {i + 1}
            </div>
          ),
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder="kg"
          inputMode="decimal"
          className="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          value={reps}
          onChange={(e) => onRepsChange(e.target.value)}
          placeholder="reps"
          inputMode="numeric"
          className="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={onLog}
          disabled={isLogging}
          className="px-6 bg-brand-500 text-neutral-950 font-semibold rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:hover:bg-brand-500"
        >
          Log
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="text-neutral-400 text-sm hover:text-neutral-50 transition-colors disabled:opacity-30 disabled:hover:text-neutral-400"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          {loggedCount > 0 && (
            <button
              onClick={onUndoLastSet}
              disabled={isLogging}
              className="text-neutral-400 text-sm hover:text-red-500 transition-colors disabled:opacity-50"
            >
              Undo last set
            </button>
          )}
          <button
            onClick={onNext}
            className="text-neutral-400 text-sm hover:text-neutral-50 transition-colors"
          >
            Next exercise →
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutHero;
