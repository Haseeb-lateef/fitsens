import { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { getWeekPlan, createPlanEntry, updatePlanEntry, deletePlanEntry } from "../api/plan";
import { getExercises, createExercise } from "../api/exercises";
import type { WeekPlan, DayOfWeek, PlannedExerciseOut } from "../types/plan";
import type { ExerciseOut } from "../types/exercise";

const DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const inputClass =
  "w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function PlanEditor() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [exercises, setExercises] = useState<ExerciseOut[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add form. Picking an existing exercise is the primary path — creating a new
  // one is opt-in, so adding the same exercise to a second day reuses its id
  // instead of making a duplicate that would split progression history.
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | "">("");
  const [newName, setNewName] = useState("");
  const [newMuscleGroup, setNewMuscleGroup] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getWeekPlan(), getExercises()])
      .then(([planData, exerciseData]) => {
        setWeekPlan(planData);
        setExercises(exerciseData);
      })
      .catch((err: unknown) => setLoadError(errorMessage(err, "Couldn't load your plan.")));
  }, []);

  if (loadError) {
    return <p className="text-red-400 text-sm">{loadError}</p>;
  }

  if (!weekPlan) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  const dayEntries = weekPlan[selectedDay];

  function resetAddForm() {
    setSelectedExerciseId("");
    setNewName("");
    setNewMuscleGroup("");
    setTargetSets("");
    setTargetReps("");
    setAddError(null);
    setIsCreatingNew(false);
  }

  async function handleAdd() {
    if (isAdding) return;
    setAddError(null);

    if (isCreatingNew && newName.trim() === "") {
      setAddError("Give the exercise a name.");
      return;
    }
    if (!isCreatingNew && selectedExerciseId === "") {
      setAddError("Pick an exercise, or add a new one.");
      return;
    }

    setIsAdding(true);
    try {
      let exerciseId: number;

      if (isCreatingNew) {
        const created = await createExercise({
          name: newName.trim(),
          muscle_group: newMuscleGroup.trim() === "" ? null : newMuscleGroup.trim(),
        });
        setExercises((prev) => [...prev, created]);
        exerciseId = created.id;
      } else {
        exerciseId = selectedExerciseId as number;
      }

      const newEntry = await createPlanEntry(selectedDay, {
        exercise_id: exerciseId,
        display_order: dayEntries.length,
        target_sets: targetSets === "" ? null : Number(targetSets),
        target_reps: targetReps === "" ? null : Number(targetReps),
      });

      setWeekPlan((prev) => prev && { ...prev, [selectedDay]: [...prev[selectedDay], newEntry] });
      resetAddForm();
    } catch (err: unknown) {
      // A duplicate name comes back as 409 with a message naming the existing
      // exercise, which is what we want to show verbatim.
      setAddError(errorMessage(err, "Couldn't add the exercise."));
    } finally {
      setIsAdding(false);
    }
  }

  function startEditing(entry: PlannedExerciseOut) {
    setEditingId(entry.id);
    setEditSets(entry.target_sets === null ? "" : String(entry.target_sets));
    setEditReps(entry.target_reps === null ? "" : String(entry.target_reps));
    setRowError(null);
  }

  async function handleSaveEdit(entryId: number) {
    setRowError(null);
    try {
      const updated = await updatePlanEntry(entryId, {
        target_sets: editSets === "" ? null : Number(editSets),
        target_reps: editReps === "" ? null : Number(editReps),
      });
      setWeekPlan(
        (prev) =>
          prev && {
            ...prev,
            [selectedDay]: prev[selectedDay].map((entry) => (entry.id === updated.id ? updated : entry)),
          },
      );
      setEditingId(null);
    } catch (err: unknown) {
      setRowError(errorMessage(err, "Couldn't save the target."));
    }
  }

  async function handleDelete(id: number) {
    setRowError(null);
    try {
      await deletePlanEntry(id);
      setWeekPlan(
        (prev) => prev && { ...prev, [selectedDay]: prev[selectedDay].filter((entry) => entry.id !== id) },
      );
    } catch (err: unknown) {
      setRowError(errorMessage(err, "Couldn't remove the exercise."));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 overflow-x-auto bg-neutral-900 rounded-full p-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => {
              setSelectedDay(day);
              setEditingId(null);
              setRowError(null);
            }}
            className={`px-3 py-1.5 rounded-full text-sm capitalize whitespace-nowrap transition-colors ${
              selectedDay === day
                ? "bg-brand-500 text-neutral-950 font-semibold"
                : "text-neutral-400 hover:text-neutral-50"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3">
        {isCreatingNew ? (
          <>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Exercise name"
              className={inputClass}
            />
            <input
              value={newMuscleGroup}
              onChange={(e) => setNewMuscleGroup(e.target.value)}
              placeholder="Muscle group (optional)"
              className={inputClass}
            />
          </>
        ) : (
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          >
            <option value="">Select exercise</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => {
            setIsCreatingNew((prev) => !prev);
            setAddError(null);
          }}
          className="self-start text-brand-500 text-sm hover:text-brand-600 transition-colors"
        >
          {isCreatingNew ? "← Pick an existing exercise" : "+ New exercise"}
        </button>

        <div className="flex gap-2">
          <input
            value={targetSets}
            onChange={(e) => setTargetSets(e.target.value)}
            placeholder="Sets"
            inputMode="numeric"
            className={inputClass}
          />
          <input
            value={targetReps}
            onChange={(e) => setTargetReps(e.target.value)}
            placeholder="Reps"
            inputMode="numeric"
            className={inputClass}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:hover:bg-brand-500"
        >
          Add to {selectedDay}
        </button>

        {addError && <p className="text-red-400 text-sm">{addError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {rowError && <p className="text-red-400 text-sm">{rowError}</p>}
        {dayEntries.length === 0 && <p className="text-neutral-400 text-sm">No exercises planned for this day.</p>}

        {dayEntries.map((entry) => {
          const exercise = exercises.find((ex) => ex.id === entry.exercise_id);
          const isEditing = editingId === entry.id;

          return (
            <div key={entry.id} className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-neutral-50 truncate">{exercise?.name ?? "Unknown exercise"}</p>
                  {exercise?.muscle_group && (
                    <p className="text-neutral-400 text-sm">{exercise.muscle_group}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {!isEditing && (
                    <span className="text-neutral-400 text-sm">
                      {entry.target_sets !== null && entry.target_reps !== null
                        ? `${entry.target_sets} × ${entry.target_reps}`
                        : entry.target_sets !== null
                          ? `${entry.target_sets} sets`
                          : "No target"}
                    </span>
                  )}
                  <button
                    onClick={() => (isEditing ? setEditingId(null) : startEditing(entry))}
                    aria-label={isEditing ? "Cancel editing" : `Edit target for ${exercise?.name ?? "exercise"}`}
                    className="text-neutral-400 hover:text-neutral-50 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Remove ${exercise?.name ?? "exercise"} from ${selectedDay}`}
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <input
                    value={editSets}
                    onChange={(e) => setEditSets(e.target.value)}
                    placeholder="Sets"
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <input
                    value={editReps}
                    onChange={(e) => setEditReps(e.target.value)}
                    placeholder="Reps"
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <button
                    onClick={() => handleSaveEdit(entry.id)}
                    className="px-4 bg-brand-500 text-neutral-950 font-semibold rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlanEditor;
