import { useEffect, useRef, useState } from "react";
import { getDayPlan } from "../api/plan";
import { getExercises } from "../api/exercises";
import { createWorkoutSet, deleteWorkoutSet, getLastSession } from "../api/workoutSets";
import type { PlannedExerciseOut, DayOfWeek } from "../types/plan";
import type { ExerciseOut } from "../types/exercise";
import type { LastSessionSet, WorkoutSetOut } from "../types/workoutSet";
import WorkoutHero from "./WorkoutHero";
import UpNextRow from "./UpNextRow";

const DAYS_BY_JS_INDEX: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Fallback for plan entries created before targets existed.
const DEFAULT_SETS = 3;

// Reps come from the plan target (a goal you set); weight comes from your last
// session (a number you beat). Sets already logged today win over both, so
// continuing a session repeats what you just did rather than resetting.
function prefillFor(
  entry: PlannedExerciseOut,
  todaySets: WorkoutSetOut[] | undefined,
  history: LastSessionSet[] | undefined,
) {
  if (todaySets && todaySets.length > 0) {
    const last = todaySets[todaySets.length - 1];
    return { weight: String(last.weight_kg), reps: String(last.reps) };
  }

  const historyReps = history && history.length > 0 ? String(history[0].reps) : "";

  return {
    weight: history && history.length > 0 ? String(history[0].weight_kg) : "",
    reps: entry.target_reps != null ? String(entry.target_reps) : historyReps,
  };
}

function TodayWorkout() {
  const today = DAYS_BY_JS_INDEX[new Date().getDay()];

  const [plan, setPlan] = useState<PlannedExerciseOut[] | null>(null);
  const [exercises, setExercises] = useState<ExerciseOut[]>([]);
  const [lastSessions, setLastSessions] = useState<Record<number, LastSessionSet[]>>({});
  const [loggedSets, setLoggedSets] = useState<Record<number, WorkoutSetOut[]>>({});
  const [doneManually, setDoneManually] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const loggingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setPlan(null);
    setLoadError(null);

    (async () => {
      try {
        // The plan and the exercise catalog don't depend on each other, so fetch
        // them together. Only the last-session calls need the plan first, which
        // keeps this to two round trips instead of three — it's the difference
        // between usable and not on a phone.
        const [planData, exData] = await Promise.all([getDayPlan(today), getExercises()]);

        // An exercise deleted while still on the plan leaves a dangling entry, and
        // /last-session 404s for it. Drop those from today rather than showing a
        // phantom exercise — the plan editor still lists it so it can be removed.
        const liveIds = new Set(exData.map((exercise) => exercise.id));
        const dayPlan = planData.filter((entry) => liveIds.has(entry.exercise_id));

        // Per-call catch: one exercise's missing history must not take down the
        // whole screen, which is what Promise.all's all-or-nothing behaviour did.
        const sessions = await Promise.all(
          dayPlan.map((entry) =>
            getLastSession(entry.exercise_id).catch(() => [] as LastSessionSet[]),
          ),
        );
        if (!active) return;

        const sessionMap: Record<number, LastSessionSet[]> = {};
        dayPlan.forEach((entry, i) => {
          sessionMap[entry.exercise_id] = sessions[i];
        });

        setExercises(exData);
        setLastSessions(sessionMap);
        setPlan(dayPlan);
        setCurrentIndex(0);

        if (dayPlan.length > 0) {
          const first = dayPlan[0];
          const prefill = prefillFor(first, undefined, sessionMap[first.exercise_id]);
          setWeight(prefill.weight);
          setReps(prefill.reps);
        }
      } catch (err: unknown) {
        if (!active) return;
        // Without this the screen sat on "Loading..." forever on any failure.
        setLoadError(err instanceof Error ? err.message : "Couldn't load today's workout.");
      }
    })();

    return () => {
      active = false;
    };
  }, [today, reloadKey]);

  function exerciseFor(exerciseId: number) {
    return exercises.find((exercise) => exercise.id === exerciseId);
  }

  // The target is set on the plan entry, not derived from history, so the same
  // exercise can be programmed differently on different days.
  function suggestedFor(entry: PlannedExerciseOut) {
    return entry.target_sets ?? DEFAULT_SETS;
  }

  function loggedCountFor(exerciseId: number) {
    return loggedSets[exerciseId]?.length ?? 0;
  }

  function isComplete(entry: PlannedExerciseOut, logged = loggedSets, done = doneManually) {
    const count = logged[entry.exercise_id]?.length ?? 0;
    return count >= suggestedFor(entry) || done.includes(entry.id);
  }

  function nextIncompleteIndex(logged: Record<number, WorkoutSetOut[]>, done: number[]) {
    if (!plan) return -1;
    for (let i = 1; i <= plan.length; i++) {
      const idx = (currentIndex + i) % plan.length;
      if (!isComplete(plan[idx], logged, done)) return idx;
    }
    return -1;
  }

  function goToExercise(idx: number, logged = loggedSets) {
    if (!plan) return;
    setCurrentIndex(idx);

    const entry = plan[idx];
    const prefill = prefillFor(entry, logged[entry.exercise_id], lastSessions[entry.exercise_id]);
    setWeight(prefill.weight);
    setReps(prefill.reps);
  }

  async function handleLog() {
    if (!plan) return;

    const exerciseId = plan[currentIndex].exercise_id;
    const weightValue = Number(weight);
    const repsValue = Number(reps);
    if (weight === "" || reps === "" || Number.isNaN(weightValue) || Number.isNaN(repsValue)) return;

    if (loggingRef.current) return;
    loggingRef.current = true;
    setIsLogging(true);

    try {
      const newSet = await createWorkoutSet({
        exercise_id: exerciseId,
        weight_kg: weightValue,
        reps: repsValue,
      });

      const nextLogged = {
        ...loggedSets,
        [exerciseId]: [...(loggedSets[exerciseId] ?? []), newSet],
      };
      setLoggedSets(nextLogged);
      setWeight(String(weightValue));
      setReps(String(repsValue));

      const newCount = (loggedSets[exerciseId]?.length ?? 0) + 1;
      if (newCount >= suggestedFor(plan[currentIndex])) {
        const idx = nextIncompleteIndex(nextLogged, doneManually);
        if (idx !== -1) goToExercise(idx, nextLogged);
      }
    } finally {
      loggingRef.current = false;
      setIsLogging(false);
    }
  }

  async function handleUndoLastSet() {
    if (!plan) return;

    const exerciseId = plan[currentIndex].exercise_id;
    const sets = loggedSets[exerciseId];
    if (!sets || sets.length === 0) return;

    // Shares the log guard so an undo can't race a log, or fire twice itself.
    if (loggingRef.current) return;
    loggingRef.current = true;
    setIsLogging(true);

    try {
      const lastSet = sets[sets.length - 1];
      await deleteWorkoutSet(lastSet.id);
      setLoggedSets({ ...loggedSets, [exerciseId]: sets.slice(0, -1) });
      setWeight(String(lastSet.weight_kg));
      setReps(String(lastSet.reps));
    } finally {
      loggingRef.current = false;
      setIsLogging(false);
    }
  }

  function handlePrevious() {
    if (!plan || currentIndex === 0) return;

    const previousIndex = currentIndex - 1;
    // Going back undoes a skip, so the exercise stops reading as complete.
    setDoneManually((done) => done.filter((id) => id !== plan[previousIndex].id));
    goToExercise(previousIndex);
  }

  function handleNext() {
    if (!plan) return;

    const entry = plan[currentIndex];
    const nextDone = doneManually.includes(entry.id) ? doneManually : [...doneManually, entry.id];
    setDoneManually(nextDone);

    const idx = nextIncompleteIndex(loggedSets, nextDone);
    if (idx !== -1) goToExercise(idx, loggedSets);
  }

  if (loadError) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-neutral-50 font-semibold">Couldn't load today's workout</p>
        <p className="text-neutral-400 text-sm">{loadError}</p>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="self-start px-4 py-2 bg-brand-500 text-neutral-950 font-semibold rounded-lg hover:bg-brand-600 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!plan) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  if (plan.length === 0) {
    return <p className="text-neutral-400 text-sm">No exercises planned for today.</p>;
  }

  const muscleGroups = [
    ...new Set(
      plan
        .map((entry) => exerciseFor(entry.exercise_id)?.muscle_group)
        .filter((group): group is string => Boolean(group)),
    ),
  ];

  const current = plan[currentIndex];
  const currentExercise = exerciseFor(current.exercise_id);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-brand-500 text-sm font-semibold uppercase tracking-wide">
        {today}
        {muscleGroups.length > 0 ? ` · ${muscleGroups.join(" / ")}` : ""}
      </p>

      <WorkoutHero
        name={currentExercise?.name ?? "Unknown exercise"}
        suggested={suggestedFor(current)}
        loggedCount={loggedCountFor(current.exercise_id)}
        lastSession={lastSessions[current.exercise_id] ?? []}
        weight={weight}
        reps={reps}
        isLogging={isLogging}
        canGoPrevious={currentIndex > 0}
        onWeightChange={setWeight}
        onRepsChange={setReps}
        onLog={handleLog}
        onUndoLastSet={handleUndoLastSet}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <div className="flex flex-col gap-2">
        <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wide">Up Next</p>
        {plan.map((entry, idx) => {
          const exercise = exerciseFor(entry.exercise_id);
          return (
            <UpNextRow
              key={entry.id}
              name={exercise?.name ?? "Unknown exercise"}
              loggedCount={loggedCountFor(entry.exercise_id)}
              suggested={suggestedFor(entry)}
              isCurrent={idx === currentIndex}
              isComplete={isComplete(entry)}
              onClick={() => goToExercise(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TodayWorkout;
