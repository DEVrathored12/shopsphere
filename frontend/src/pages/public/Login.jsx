import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(form);
      const fallback =
        loggedInUser.role === "admin"
          ? "/admin"
          : loggedInUser.role === "shop_owner"
          ? "/owner/dashboard"
          : "/dashboard";
      const redirectTo = location.state?.from?.pathname || fallback;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-border rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-primary mb-6">Log in</h1>

        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <label className="block text-sm text-secondary mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 rounded-lg border border-border px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <label className="block text-sm text-secondary mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full mb-6 rounded-lg border border-border px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent text-white font-medium py-2.5 transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-sm text-secondary text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-accent font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
