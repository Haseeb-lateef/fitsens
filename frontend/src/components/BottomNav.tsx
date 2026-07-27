import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/workouts", label: "Workouts" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/progress", label: "Progress" },
];

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 flex justify-around py-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            `text-sm px-3 py-1 ${isActive ? "text-brand-500 font-semibold" : "text-neutral-400"}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
