import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { login as loginRequest } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await loginRequest({ email, password });
      login(response.access_token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 gap-6 overflow-hidden bg-neutral-950">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <pattern
            id="dumbbell-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-20)"
          >
            <g stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.1">
              <line x1="30" y1="40" x2="50" y2="40" />
              <line x1="26" y1="32" x2="26" y2="48" />
              <line x1="20" y1="35" x2="20" y2="45" />
              <line x1="54" y1="32" x2="54" y2="48" />
              <line x1="60" y1="35" x2="60" y2="45" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dumbbell-pattern)" />
      </svg>

      <div className="relative z-10 flex items-center gap-2 text-brand-500">
        <Dumbbell size={28} />
        <span className="text-2xl font-bold text-neutral-50">Fitsens</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[400px] bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-neutral-50">Welcome back</h1>
          <p className="text-neutral-400 text-sm">Log in to continue your progress.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-neutral-400 text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-neutral-400 text-sm">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 pr-10 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-neutral-400 text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
