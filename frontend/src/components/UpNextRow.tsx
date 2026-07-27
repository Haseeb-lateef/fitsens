import { Check } from "lucide-react";

interface UpNextRowProps {
  name: string;
  loggedCount: number;
  suggested: number;
  isCurrent: boolean;
  isComplete: boolean;
  onClick: () => void;
}

function UpNextRow({ name, loggedCount, suggested, isCurrent, isComplete, onClick }: UpNextRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
        isCurrent
          ? "bg-neutral-900 border border-brand-500/40"
          : "bg-neutral-900 border border-transparent hover:border-neutral-800"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-5 flex items-center justify-center">
          {isComplete ? (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-neutral-950 flex items-center justify-center">
              <Check size={13} />
            </span>
          ) : isCurrent ? (
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          )}
        </span>
        <span className={isComplete ? "text-neutral-400" : "text-neutral-50"}>{name}</span>
      </div>
      <span className="text-neutral-400 text-sm">
        {loggedCount}/{suggested}
      </span>
    </button>
  );
}

export default UpNextRow;
