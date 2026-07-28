import { useEffect, useState } from "react";
import { Sparkles, PlusCircle, Sunrise, Sun, Moon, Cookie } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getFoodLogsForDate, createFoodLog, deleteFoodLog, parseFoodLog } from "../api/foodLog";
import type { FoodLogOut, MealType } from "../types/foodLog";
import FoodLogCard from "../components/FoodLogCard";
import { toLocalDateString } from "../utils/dates";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

// Order and presentation of the day's meal sections.
const MEAL_SECTIONS: { type: MealType; label: string; Icon: LucideIcon; iconClass: string }[] = [
  { type: "breakfast", label: "Breakfast", Icon: Sunrise, iconClass: "text-amber-400" },
  { type: "lunch", label: "Lunch", Icon: Sun, iconClass: "text-orange-400" },
  { type: "dinner", label: "Dinner", Icon: Moon, iconClass: "text-indigo-400" },
  { type: "snack", label: "Snacks", Icon: Cookie, iconClass: "text-brand-500" },
];

const inputClass =
  "w-full min-w-0 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

function Nutrition() {
  const [logs, setLogs] = useState<FoodLogOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [error, setError] = useState<string | null>(null);
  const [parseText, setParseText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    getFoodLogsForDate(toLocalDateString())
      .then(setLogs)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : "Failed to load today's food log"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleParse() {
    if (parseText === "") return;
    setParseError(null);
    setIsParsing(true);

    try {
      const parsed = await parseFoodLog(parseText);
      setName(parsed.name ?? "");
      setCalories(parsed.calories?.toString() ?? "");
      setProtein(parsed.protein_g?.toString() ?? "");
      setCarbs(parsed.carbs_g?.toString() ?? "");
      setFat(parsed.fat_g?.toString() ?? "");
      setMealType(parsed.meal_type ?? "breakfast");
      setParseText("");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse food description");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const newLog = await createFoodLog({
        name,
        calories: Number(calories),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fat_g: Number(fat),
        meal_type: mealType,
      });
      setLogs((prev) => [...prev, newLog]);
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setMealType("breakfast");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add food log");
    }
  }

  async function handleDelete(id: number) {
    await deleteFoodLog(id);
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-400">Loading...</div>;
  }

  const sections = MEAL_SECTIONS.map((section) => {
    const items = logs.filter((log) => log.meal_type === section.type);
    return {
      ...section,
      items,
      calories: items.reduce((sum, log) => sum + log.calories, 0),
    };
  }).filter((section) => section.items.length > 0);

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-50">Nutrition</h1>

      <div className="flex gap-2 bg-neutral-900 rounded-2xl p-4">
        <input
          value={parseText}
          onChange={(e) => setParseText(e.target.value)}
          placeholder="Describe what you ate..."
          className={inputClass}
        />
        <button
          onClick={handleParse}
          disabled={isParsing}
          className="flex items-center gap-1.5 whitespace-nowrap bg-brand-500 text-neutral-950 font-semibold rounded-lg px-4 hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Sparkles size={16} />
          {isParsing ? "Parsing..." : "AI Parse"}
        </button>
      </div>
      {parseError && <p className="text-red-400 text-sm">{parseError}</p>}

      <form onSubmit={handleAdd} className="flex flex-col gap-2 bg-neutral-900 rounded-2xl p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Food name"
          className={inputClass}
        />
        <div className="flex gap-2">
          <input
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="kcal"
            inputMode="numeric"
            className={inputClass}
          />
          <input
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="protein g"
            inputMode="decimal"
            className={inputClass}
          />
          <input
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="carbs g"
            inputMode="decimal"
            className={inputClass}
          />
          <input
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="fat g"
            inputMode="decimal"
            className={inputClass}
          />
        </div>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className={`${inputClass} capitalize`}
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 transition-colors"
        >
          <PlusCircle size={18} />
          Add Food
        </button>
      </form>

      {loadError && <p className="text-red-400 text-sm">{loadError}</p>}

      {!loadError && sections.length === 0 && (
        <p className="text-neutral-400 text-sm">Nothing logged today yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {sections.map(({ type, label, Icon, iconClass, items, calories: sectionCalories }) => (
          <div key={type} className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon size={18} className={iconClass} />
                <p className="text-neutral-50 font-semibold">{label}</p>
              </div>
              <span className="text-brand-500 text-sm font-semibold">{sectionCalories} kcal</span>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((log) => (
                <FoodLogCard key={log.id} log={log} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Nutrition;
