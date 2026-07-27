import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [username, setUsername] = useState("");
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
      const response = await register({ username, email, password });
      login(response.access_token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 gap-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/register.png')" }}
      />
      <div className="absolute inset-0 bg-neutral-950/80" />

      <div className="relative z-10 flex items-center gap-2 text-brand-500">
        <Dumbbell size={28} />
        <span className="text-2xl font-bold text-neutral-50">Fitsens</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[400px] bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-neutral-50">Create your account</h1>
          <p className="text-neutral-400 text-sm">Start tracking your training and nutrition.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-neutral-400 text-sm">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
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
              autoComplete="new-password"
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
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-neutral-400 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-500 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
