import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, Store, Sparkles, MapPin, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const FEATURES = [
  { icon: MapPin, text: "Discover shops near you" },
  { icon: Star, text: "Read & write reviews" },
  { icon: Sparkles, text: "Save your favourites" },
];

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
      const from = location.state?.from?.pathname;
      // Don't redirect to a route that belongs to a different role
      const safeFallback =
        loggedInUser.role === "admin" ? "/admin"
        : loggedInUser.role === "shop_owner" ? "/owner/dashboard"
        : "/dashboard";
      const dest = from && from.startsWith(
        loggedInUser.role === "admin" ? "/admin"
        : loggedInUser.role === "shop_owner" ? "/owner"
        : "/"
      ) ? from : safeFallback;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — dark branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-white">Shop</span>
            <span className="text-xl font-bold text-accent">Sphere</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display text-4xl font-bold text-white leading-tight mb-4"
          >
            Discover Local.<br />
            <span className="text-accent">See More.</span><br />
            Visit Smarter.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white/60 text-sm mb-8"
          >
            Connect with local shops, explore products, and visit smarter.
          </motion.p>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-white/30 text-xs">© {new Date().getFullYear()} ShopSphere</p>
      </motion.div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-primary">Shop</span>
              <span className="text-xl font-bold text-accent">Sphere</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-primary mb-1">Welcome back</h1>
          <p className="text-secondary text-sm mb-8">Sign in to your account to continue.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-6 rounded-xl bg-danger/10 text-danger text-sm px-4 py-3 border border-danger/20"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  id="email" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  id="password" name="password" type="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition text-sm"
                />
              </div>
            </div>

            <motion.button
              type="submit" disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold py-3 transition hover:bg-primary/90 disabled:opacity-60 text-sm mt-2"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-secondary">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-accent font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
