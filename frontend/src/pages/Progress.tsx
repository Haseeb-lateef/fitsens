import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getBodyweightLogs, createBodyweightLog, deleteBodyweightLog } from "../api/bodyweightLog";
import type { BodyweightLogOut } from "../types/bodyweightLog";
import { formatShortDate } from "../utils/dates";

function Progress() {
  const [logs, setLogs] = useState<BodyweightLogOut[]>([]);
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBodyweightLogs()
      .then(setLogs)
      .finally(() => setIsLoading(false));
  }, []);

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

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-50">Progress</h1>

      <form onSubmit={handleAdd} className="flex gap-2 bg-neutral-900 rounded-2xl p-4">
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
          inputMode="decimal"
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" className="bg-brand-500 text-neutral-950 font-semibold rounded-lg px-4 hover:bg-brand-600 transition-colors">
          Log Weight
        </button>
      </form>

      {chartData.length > 1 && (
        <div className="bg-neutral-900 rounded-2xl p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#404040" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
              <YAxis stroke="#a3a3a3" fontSize={12} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040" }} labelStyle={{ color: "#fafafa" }} />
              <Line type="monotone" dataKey="weight" stroke="#84cc16" strokeWidth={2} dot={{ fill: "#84cc16" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-neutral-50">{log.weight_kg} kg</p>
            <button onClick={() => handleDelete(log.id)} className="text-red-500 text-sm">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Progress;
