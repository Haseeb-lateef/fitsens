import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[480px] bg-neutral-900 rounded-2xl p-6 flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold text-neutral-50">Log in</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 text-neutral-950 font-semibold rounded-lg py-2 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
