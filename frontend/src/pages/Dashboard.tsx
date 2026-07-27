import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Flame, Beef, Dumbbell, Play } from "lucide-react";
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

  const weightChartData = bodyweightLogs.map((log) => ({
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
          icon={Beef}
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
          <>
            <h2 className="text-2xl font-bold text-neutral-50 capitalize">{today}</h2>
            {muscleGroups.length > 0 && (
              <p className="text-neutral-400 text-sm capitalize">{muscleGroups.join(" • ")}</p>
            )}
            <p className="text-neutral-50 text-sm">
              {todayPlan.length} Exercise{todayPlan.length > 1 ? "s" : ""}
            </p>
          </>
        )}

        <Link
          to="/workouts"
          className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors"
        >
          <Play size={16} />
          Start Workout
        </Link>
      </div>

      {weightChartData.length > 1 && (
        <div className="bg-neutral-900 rounded-2xl p-4">
          <p className="text-neutral-50 font-semibold mb-2">Weight Progress</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <Line type="monotone" dataKey="weight" stroke="#84cc16" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
