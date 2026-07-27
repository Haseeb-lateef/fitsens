import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="p-4 flex justify-between items-center">
      <span>Dashboard</span>
      <Link to="/profile" className="text-neutral-400 text-sm">
        Profile
      </Link>
    </div>
  );
}

export default Dashboard;
