import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGoals, updateGoals } from "../api/goal";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const [calorieTarget, setCalorieTarget] = useState("");
  const [proteinTarget, setProteinTarget] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getGoals()
      .then((goals) => {
        setCalorieTarget(goals.daily_calorie_target?.toString() ?? "");
        setProteinTarget(goals.protein_target_g?.toString() ?? "");
        setGoalWeight(goals.goal_weight_kg?.toString() ?? "");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);

    await updateGoals({
      daily_calorie_target: calorieTarget === "" ? null : Number(calorieTarget),
      protein_target_g: proteinTarget === "" ? null : Number(proteinTarget),
      goal_weight_kg: goalWeight === "" ? null : Number(goalWeight),
    });

    setIsSaving(false);
    setSaved(true);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-400">Loading...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-50">Profile</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-2 bg-neutral-900 rounded-2xl p-4">
        <label className="text-neutral-400 text-sm">Daily calorie target</label>
        <input
          value={calorieTarget}
          onChange={(e) => setCalorieTarget(e.target.value)}
          placeholder="kcal"
          inputMode="numeric"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <label className="text-neutral-400 text-sm">Protein target (g)</label>
        <input
          value={proteinTarget}
          onChange={(e) => setProteinTarget(e.target.value)}
          placeholder="g"
          inputMode="decimal"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <label className="text-neutral-400 text-sm">Goal weight (kg)</label>
        <input
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
          placeholder="kg"
          inputMode="decimal"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {saved && <p className="text-brand-500 text-sm">Saved.</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving..." : "Save Goals"}
        </button>
      </form>

      <button onClick={handleLogout} className="text-red-500 text-sm text-left">
        Log out
      </button>
    </div>
  );
}

export default Profile;
