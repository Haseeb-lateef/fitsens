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

const DEFAULT_SETS = 3;

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
  const loggingRef = useRef(false);

  useEffect(() => {
    let active = true;

    getDayPlan(today).then(async (planData) => {
      const exData = await getExercises();
      const sessions = await Promise.all(planData.map((entry) => getLastSession(entry.exercise_id)));
      if (!active) return;

      const sessionMap: Record<number, LastSessionSet[]> = {};
      planData.forEach((entry, i) => {
        sessionMap[entry.exercise_id] = sessions[i];
      });

      setExercises(exData);
      setLastSessions(sessionMap);
      setPlan(planData);
      setCurrentIndex(0);

      if (planData.length > 0) {
        const firstHistory = sessionMap[planData[0].exercise_id];
        if (firstHistory && firstHistory.length > 0) {
          setWeight(String(firstHistory[0].weight_kg));
          setReps(String(firstHistory[0].reps));
        }
      }
    });

    return () => {
      active = false;
    };
  }, [today]);

  function exerciseFor(exerciseId: number) {
    return exercises.find((exercise) => exercise.id === exerciseId);
  }

  function suggestedFor(exerciseId: number) {
    return lastSessions[exerciseId]?.length || DEFAULT_SETS;
  }

  function loggedCountFor(exerciseId: number) {
    return loggedSets[exerciseId]?.length ?? 0;
  }

  function isComplete(entry: PlannedExerciseOut, logged = loggedSets, done = doneManually) {
    const count = logged[entry.exercise_id]?.length ?? 0;
    return count >= suggestedFor(entry.exercise_id) || done.includes(entry.id);
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

    const exerciseId = plan[idx].exercise_id;
    const todaySets = logged[exerciseId];

    if (todaySets && todaySets.length > 0) {
      const last = todaySets[todaySets.length - 1];
      setWeight(String(last.weight_kg));
      setReps(String(last.reps));
      return;
    }

    const history = lastSessions[exerciseId];
    if (history && history.length > 0) {
      setWeight(String(history[0].weight_kg));
      setReps(String(history[0].reps));
    } else {
      setWeight("");
      setReps("");
    }
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
      if (newCount >= suggestedFor(exerciseId)) {
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
        suggested={suggestedFor(current.exercise_id)}
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
              suggested={suggestedFor(entry.exercise_id)}
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
