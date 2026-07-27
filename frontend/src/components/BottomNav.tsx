import { NavLink } from "react-router-dom";
import { Home, Dumbbell, Utensils, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";

const links: { to: string; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/nutrition", label: "Nutrition", icon: Utensils },
  { to: "/progress", label: "Progress", icon: TrendingUp },
];

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 flex justify-around pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs px-3 py-1 ${isActive ? "text-brand-500 font-semibold" : "text-neutral-400"}`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
