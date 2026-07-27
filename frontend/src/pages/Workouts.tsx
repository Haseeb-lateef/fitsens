import { useState } from "react";
import ExerciseLibrary from "../components/ExerciseLibrary";
import PlanEditor from "../components/PlanEditor";
import TodayWorkout from "../components/TodayWorkout";

type Section = "today" | "plan" | "library";

function Workouts() {
  const [section, setSection] = useState<Section>("today");

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-50">Workouts</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setSection("today")}
          className={`px-3 py-1 rounded-full text-sm ${
            section === "today" ? "bg-brand-500 text-neutral-950 font-semibold" : "bg-neutral-900 text-neutral-400"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setSection("plan")}
          className={`px-3 py-1 rounded-full text-sm ${
            section === "plan" ? "bg-brand-500 text-neutral-950 font-semibold" : "bg-neutral-900 text-neutral-400"
          }`}
        >
          Plan
        </button>
        <button
          onClick={() => setSection("library")}
          className={`px-3 py-1 rounded-full text-sm ${
            section === "library" ? "bg-brand-500 text-neutral-950 font-semibold" : "bg-neutral-900 text-neutral-400"
          }`}
        >
          Exercises
        </button>
      </div>

      {section === "today" && <TodayWorkout />}
      {section === "plan" && <PlanEditor />}
      {section === "library" && <ExerciseLibrary />}
    </div>
  );
}

export default Workouts;
