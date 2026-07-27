import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flame, Drumstick, Dumbbell, Play, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { getFoodLogsForDate } from "../api/foodLog";
import { getGoals } from "../api/goal";
import { getBodyweightLogs } from "../api/bodyweightLog";
import { getDayPlan } from "../api/plan";
import { getExercises } from "../api/exercises";
import type { GoalOut } from "../types/goal";
import type { BodyweightLogOut } from "../types/bodyweightLog";
import type { PlannedExerciseOut, DayOfWeek } from "../types/plan";
import type { ExerciseOut } from "../types/exercise";
import StatRing from "../components/StatRing";
import { formatShortDate } from "../utils/dates";

const DAYS_BY_JS_INDEX: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [goals, setGoals] = useState<GoalOut | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [bodyweightLogs, setBodyweightLogs] = useState<BodyweightLogOut[]>([]);
  const [todayPlan, setTodayPlan] = useState<PlannedExerciseOut[]>([]);
  const [exercises, setExercises] = useState<ExerciseOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = DAYS_BY_JS_INDEX[new Date().getDay()];
  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      getGoals(),
      getFoodLogsForDate(todayDate),
      getBodyweightLogs(),
      getDayPlan(today),
      getExercises(),
    ]).then(([goalsData, foodLogs, weightLogs, planData, exercisesData]) => {
      setGoals(goalsData);
      setTodayCalories(foodLogs.reduce((sum, log) => sum + log.calories, 0));
      setTodayProtein(foodLogs.reduce((sum, log) => sum + log.protein_g, 0));
      setBodyweightLogs(weightLogs);
      setTodayPlan(planData);
      setExercises(exercisesData);
      setIsLoading(false);
    });
  }, [today, todayDate]);

  if (isLoading || !goals) {
    return <div className="p-4 text-neutral-400">Loading...</div>;
  }

  const muscleGroups = [
    ...new Set(
      todayPlan
        .map((entry) => exercises.find((exercise) => exercise.id === entry.exercise_id)?.muscle_group)
        .filter((group): group is string => Boolean(group)),
    ),
  ];

  const sortedWeights = [...bodyweightLogs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );
  const latestWeight = sortedWeights.at(-1)?.weight_kg ?? null;
  const prevWeight = sortedWeights.at(-2)?.weight_kg ?? null;
  const weightDelta =
    latestWeight !== null && prevWeight !== null ? latestWeight - prevWeight : null;

  const weightChartData = sortedWeights.map((log) => ({
    date: formatShortDate(log.logged_at),
    weight: log.weight_kg,
  }));

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-neutral-400 text-sm">{getGreeting()}</p>
          <h1 className="text-xl font-semibold text-neutral-50">Dashboard</h1>
        </div>
        <Link to="/profile" className="text-neutral-400 text-sm">
          Profile
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatRing
          label="Calories"
          value={todayCalories}
          max={goals.daily_calorie_target ?? 0}
          unit="kcal"
          color="#84cc16"
          icon={Flame}
        />
        <StatRing
          label="Protein"
          value={todayProtein}
          max={goals.protein_target_g ?? 0}
          unit="g"
          color="#a855f7"
          icon={Drumstick}
        />
      </div>

      <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-brand-500">
          <Dumbbell size={16} />
          <span className="text-neutral-400 text-xs">Today's Workout</span>
        </div>

        {todayPlan.length === 0 ? (
          <p className="text-neutral-400 text-sm">No exercises planned for today.</p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-neutral-50 capitalize">{today}</h2>
              {muscleGroups.length > 0 && (
                <p className="text-neutral-400 text-sm capitalize">{muscleGroups.join(" • ")}</p>
              )}
              <div>
                <span className="bg-neutral-800 text-neutral-300 text-xs rounded-full px-2.5 py-1">
                  {todayPlan.length} Exercise{todayPlan.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0" aria-hidden="true">
              <defs>
                <linearGradient
                  id="dbGrad"
                  gradientUnits="userSpaceOnUse"
                  x1="20"
                  y1="40"
                  x2="100"
                  y2="80"
                >
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="100%" stopColor="#65a30d" />
                </linearGradient>
                <radialGradient id="dbGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#84cc16" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="58" fill="url(#dbGlow)" />
              <g
                transform="rotate(-35 60 60)"
                stroke="url(#dbGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              >
                <line x1="38" y1="60" x2="82" y2="60" />
                <line x1="30" y1="46" x2="30" y2="74" />
                <line x1="22" y1="50" x2="22" y2="70" />
                <line x1="90" y1="46" x2="90" y2="74" />
                <line x1="98" y1="50" x2="98" y2="70" />
              </g>
            </svg>
          </div>
        )}

        <Link
          to="/workouts"
          className="mt-1 bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors"
        >
          <Play size={16} />
          Start Workout
        </Link>
      </div>

      {weightChartData.length > 1 && (
        <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-brand-500">
            <Scale size={16} />
            <span className="text-neutral-400 text-xs">Weight Progress</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-neutral-50">{latestWeight} kg</span>
            {weightDelta !== null && weightDelta !== 0 && (
              <span
                className={`flex items-center gap-1 text-sm mb-0.5 ${
                  weightDelta < 0 ? "text-brand-500" : "text-red-400"
                }`}
              >
                {weightDelta < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {Math.abs(weightDelta).toFixed(1)} kg
              </span>
            )}
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#a3a3a3", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={16}
                />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                <Tooltip
                  contentStyle={{
                    background: "#171717",
                    border: "1px solid #262626",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a3a3a3" }}
                  itemStyle={{ color: "#fafafa" }}
                  formatter={(value) => [`${value} kg`, "Weight"]}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#84cc16"
                  strokeWidth={2}
                  fill="url(#weightFill)"
                  dot={{ r: 3, fill: "#84cc16", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
