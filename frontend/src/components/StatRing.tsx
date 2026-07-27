import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { ComponentType } from "react";

interface StatRingProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  icon: ComponentType<{ size?: number }>;
}

function StatRing({ label, value, max, unit, color, icon: Icon }: StatRingProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const left = Math.max(max - value, 0);
  const data = [{ value: percent, fill: color }];

  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 self-start" style={{ color }}>
        <Icon size={14} />
        <span className="text-neutral-400 text-xs">{label}</span>
      </div>

      <div className="relative w-28 h-28">
        <RadialBarChart
          width={112}
          height={112}
          innerRadius="78%"
          outerRadius="100%"
          data={data}
          startAngle={225}
          endAngle={-45}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: "#262626" }} cornerRadius={999} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-neutral-50 font-bold text-xl">{value.toLocaleString()}</span>
          <span className="text-neutral-400 text-[10px]">
            / {max} {unit}
          </span>
        </div>
      </div>

      <p className="text-xs" style={{ color }}>
        {left.toLocaleString()} left
      </p>
    </div>
  );
}

export default StatRing;
