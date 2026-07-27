import { useState } from "react";
import { Dumbbell } from "lucide-react";
import ExerciseLibrary from "../components/ExerciseLibrary";
import PlanEditor from "../components/PlanEditor";
import TodayWorkout from "../components/TodayWorkout";

type Section = "today" | "plan" | "library";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "plan", label: "Plan" },
  { key: "library", label: "Exercises" },
];

function Workouts() {
  const [section, setSection] = useState<Section>("today");

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Dumbbell size={22} className="text-brand-500" />
        <h1 className="text-xl font-semibold text-neutral-50">Workouts</h1>
      </div>

      <div className="inline-flex self-start gap-1 bg-neutral-900 rounded-full p-1">
        {SECTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              section === key
                ? "bg-brand-500 text-neutral-950 font-semibold"
                : "text-neutral-400 hover:text-neutral-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "today" && <TodayWorkout />}
      {section === "plan" && <PlanEditor />}
      {section === "library" && <ExerciseLibrary />}
    </div>
  );
}

export default Workouts;
