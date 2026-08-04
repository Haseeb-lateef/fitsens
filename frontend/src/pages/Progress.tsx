import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getBodyweightLogs,
  createBodyweightLog,
  deleteBodyweightLog,
} from "../api/bodyweightLog";
import { getWorkoutSets, deleteWorkoutSet } from "../api/workoutSets";
import type { WorkoutSetOut } from "../types/workoutSet";
import { getExercises } from "../api/exercises";
import type { BodyweightLogOut } from "../types/bodyweightLog";
import type { ExerciseOut } from "../types/exercise";
import { formatShortDate } from "../utils/dates";
import { maxWeightPerDay } from "../utils/aggregations";

type ViewMode = "bodyweight" | "exercise";

function Progress() {
  const [logs, setLogs] = useState<BodyweightLogOut[]>([]);
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [exercises, setExercises] = useState<ExerciseOut[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | "">("");
  const [progressionData, setProgressionData] = useState<
    { date: string; weight: number }[]
  >([]);
  const [exerciseLogs, setExerciseLogs] = useState<WorkoutSetOut[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("bodyweight");
  useEffect(() => {
    // Force a resize event after data/view changes so Recharts' ResponsiveContainer recalculates.
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    return () => clearTimeout(t);
  }, [viewMode, logs.length, progressionData.length]);

  useEffect(() => {
    getBodyweightLogs()
      .then(setLogs)
      .finally(() => setIsLoading(false));
    getExercises().then(setExercises);
  }, []);

  useEffect(() => {
    if (selectedExerciseId === "") {
      setProgressionData([]);
      return;
    }

    getWorkoutSets(selectedExerciseId).then((sets) => {
      // Instead of one point per day, plot each set (timestamped) so intra-day progress is visible.
      const sortedAsc = sets
        .slice()
        .sort(
          (a, b) =>
            new Date(a.performed_at).getTime() -
            new Date(b.performed_at).getTime(),
        );
      setProgressionData(
        sortedAsc.map((s) => ({ date: s.performed_at, weight: s.weight_kg })),
      );
      setExerciseLogs(
        sets.sort(
          (a, b) =>
            new Date(b.performed_at).getTime() -
            new Date(a.performed_at).getTime(),
        ),
      );
    });
  }, [selectedExerciseId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (weight === "") return;

    const newLog = await createBodyweightLog({ weight_kg: Number(weight) });
    setLogs((prev) => [...prev, newLog]);
    setWeight("");
  }

  async function handleDelete(id: number) {
    await deleteBodyweightLog(id);
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-400">Loading...</div>;
  }

  const chartData = logs.map((log) => ({
    date: formatShortDate(log.logged_at),
    weight: log.weight_kg,
  }));

  const progressionChartData = progressionData.map((point) => ({
    date: formatShortDate(point.date),
    weight: point.weight,
  }));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-50">Progress</h1>
          <p className="text-neutral-400 text-sm">
            Track your bodyweight and per-exercise progression.
          </p>
        </div>

        <div className="flex gap-2 bg-neutral-900 rounded-md p-1">
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === "bodyweight" ? "bg-brand-500 text-neutral-950" : "text-neutral-400 hover:text-neutral-50"}`}
            onClick={() => setViewMode("bodyweight")}
          >
            Bodyweight
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === "exercise" ? "bg-brand-500 text-neutral-950" : "text-neutral-400 hover:text-neutral-50"}`}
            onClick={() => setViewMode("exercise")}
          >
            Exercise
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-2xl p-4">
          {viewMode === "bodyweight" ? (
            <>
              <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight (kg)"
                  inputMode="decimal"
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="bg-brand-500 text-neutral-950 font-semibold rounded-lg px-4 hover:bg-brand-600 transition-colors"
                >
                  Log
                </button>
              </form>

              {chartData.length > 1 ? (
                <div className="h-64 touch-pan-y">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ left: 24, right: 24 }}
                    >
                      <CartesianGrid stroke="#404040" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
                      <YAxis
                        stroke="#a3a3a3"
                        fontSize={12}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          border: "1px solid #404040",
                        }}
                        labelStyle={{ color: "#fafafa" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#84cc16"
                        strokeWidth={2}
                        dot={{ fill: "#84cc16" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-neutral-400 text-sm">
                  Not enough bodyweight data yet.
                </p>
              )}
            </>
          ) : (
            <div>
              <p className="text-neutral-400 text-sm mb-2">
                Select an exercise to view progression.
              </p>
              <select
                value={selectedExerciseId}
                onChange={(e) =>
                  setSelectedExerciseId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 mb-4 text-neutral-50"
              >
                <option value="">Select exercise</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>

              {selectedExerciseId === "" ? null : progressionChartData.length >
                1 ? (
                <div className="h-64 touch-pan-y">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressionChartData}
                      margin={{ left: 24, right: 24 }}
                    >
                      <CartesianGrid stroke="#404040" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
                      <YAxis
                        stroke="#a3a3a3"
                        fontSize={12}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          border: "1px solid #404040",
                        }}
                        labelStyle={{ color: "#fafafa" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#84cc16"
                        strokeWidth={2}
                        dot={{ fill: "#84cc16" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-neutral-400 text-sm">
                  Not enough exercise data yet for a chart.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-neutral-900 rounded-2xl p-4">
          <h2 className="text-neutral-50 font-semibold mb-3">Recent logs</h2>
          <div className="flex flex-col gap-2">
            {viewMode === "bodyweight"
              ? logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-neutral-950 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-neutral-50 font-medium">
                        {log.weight_kg} kg
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {formatShortDate(log.logged_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              : exerciseLogs.map((set) => (
                  <div
                    key={set.id}
                    className="bg-neutral-950 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-neutral-50 font-medium">
                        {set.weight_kg} kg × {set.reps}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {formatShortDate(set.performed_at)}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteWorkoutSet(set.id);
                        setExerciseLogs((prev) =>
                          prev.filter((s) => s.id !== set.id),
                        );
                        // also refresh progression
                        if (selectedExerciseId !== "") {
                          const sets = await getWorkoutSets(
                            selectedExerciseId as number,
                          );
                          setProgressionData(maxWeightPerDay(sets));
                        }
                      }}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;
