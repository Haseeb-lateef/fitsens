import { useEffect, useState } from "react";
import { getFoodLogs, createFoodLog, deleteFoodLog, parseFoodLog } from "../api/foodLog";
import type { FoodLogOut, MealType } from "../types/foodLog";
import FoodLogCard from "../components/FoodLogCard";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function Nutrition() {
  const [logs, setLogs] = useState<FoodLogOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    getFoodLogs()
      .then(setLogs)
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

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-50">Nutrition</h1>

      <div className="flex gap-2 bg-neutral-900 rounded-2xl p-4">
        <input
          value={parseText}
          onChange={(e) => setParseText(e.target.value)}
          placeholder="Describe what you ate..."
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleParse}
          disabled={isParsing}
          className="bg-brand-500 text-neutral-950 font-semibold rounded-lg px-4 hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {isParsing ? "Parsing..." : "AI Parse"}
        </button>
      </div>
      {parseError && <p className="text-red-400 text-sm">{parseError}</p>}

      <form onSubmit={handleAdd} className="flex flex-col gap-2 bg-neutral-900 rounded-2xl p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Food name"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex gap-2">
          <input
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="kcal"
            inputMode="numeric"
            className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="protein g"
            inputMode="decimal"
            className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="carbs g"
            inputMode="decimal"
            className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="fat g"
            inputMode="decimal"
            className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50"
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 transition-colors">
          Add Food
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <FoodLogCard key={log.id} log={log} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default Nutrition;
