import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(form);
      const fallback =
        loggedInUser.role === "admin" ? "/admin"
        : loggedInUser.role === "shop_owner" ? "/owner/dashboard"
        : "/dashboard";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-primary">ShopSphere</h1>
          <p className="text-secondary text-sm mt-1">Discover Local. See More. Visit Smarter.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="bg-white border border-border rounded-2xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-primary mb-6">Welcome back</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-5 rounded-lg bg-danger/10 text-danger text-sm px-3 py-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                id="email" name="email" type="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border pl-9 pr-3 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                id="password" name="password" type="password" required
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border pl-9 pr-3 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent text-white font-semibold py-2.5 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {submitting ? "Logging in…" : "Log in"}
          </button>

          <p className="mt-5 text-sm text-secondary text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-accent font-medium hover:underline">Register</Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
