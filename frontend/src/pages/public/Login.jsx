import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, Store, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const orbs = [
  { w: 320, h: 320, top: "-80px", left: "-80px", opacity: 0.12, delay: 0 },
  { w: 200, h: 200, bottom: "60px", right: "-60px", opacity: 0.08, delay: 0.2 },
  { w: 120, h: 120, top: "45%", left: "55%", opacity: 0.06, delay: 0.4 },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await login(form);
      const from = location.state?.from?.pathname;
      const fallback = u.role === "admin" ? "/admin" : u.role === "shop_owner" ? "/owner/dashboard" : "/dashboard";
      const prefix = u.role === "admin" ? "/admin" : u.role === "shop_owner" ? "/owner" : "/";
      navigate(from?.startsWith(prefix) ? from : fallback, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: "linear-gradient(135deg, #0B1F33 0%, #122d4a 60%, #0f2640 100%)" }}
      >
        {/* Animated orbs */}
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: o.opacity }}
            transition={{ delay: o.delay, duration: 1.2, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: o.w, height: o.h,
              top: o.top, left: o.left, bottom: o.bottom, right: o.right,
              background: "radial-gradient(circle, #C9A227, transparent 70%)",
            }}
          />
        ))}

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />

        {/* Logo */}
        <motion.div {...fadeUp(0.1)} className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Shop<span className="text-accent">Sphere</span>
          </span>
        </motion.div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <motion.h2 {...fadeUp(0.3)} className="font-display text-5xl font-bold text-white leading-[1.15]">
            Discover Local.<br />
            <span className="text-accent italic">See More.</span><br />
            Visit Smarter.
          </motion.h2>
          <motion.p {...fadeUp(0.45)} className="text-white/50 text-base leading-relaxed max-w-xs">
            Your neighbourhood, fully explored — shops, products, prices, all before you step outside.
          </motion.p>

          {/* Floating stat cards */}
          <motion.div {...fadeUp(0.55)} className="flex gap-3 pt-2">
            {[
              { value: "500+", label: "Local Shops" },
              { value: "10k+", label: "Products" },
              { value: "4.8★", label: "Avg Rating" },
            ].map(({ value, label }) => (
              <div key={label} className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-accent font-bold text-lg leading-none">{value}</p>
                <p className="text-white/40 text-xs mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p {...fadeUp(0.6)} className="relative text-white/20 text-xs">
          © {new Date().getFullYear()} ShopSphere · All rights reserved
        </motion.p>
      </motion.div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 relative">
        {/* Subtle bg accent blob */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: "radial-gradient(circle, #C9A227, transparent 70%)", transform: "translate(30%, -30%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <motion.div {...fadeUp(0)} className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xl font-bold text-primary">Shop<span className="text-accent">Sphere</span></span>
          </motion.div>

          <motion.div {...fadeUp(0.2)}>
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-2">Welcome back</p>
            <h1 className="font-display text-4xl font-bold text-primary mb-1">Sign in</h1>
            <p className="text-secondary text-sm">Don't have an account?{" "}
              <Link to="/register" className="text-accent font-semibold hover:underline">Create one free →</Link>
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 mt-6 rounded-2xl bg-danger/10 text-danger text-sm px-4 py-3 border border-danger/20"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <motion.div {...fadeUp(0.3)}>
              <label className="block text-xs font-semibold text-primary mb-2 tracking-wide uppercase" htmlFor="email">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  id="email" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3.5 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm shadow-sm"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div {...fadeUp(0.38)}>
              <label className="block text-xs font-semibold text-primary mb-2 tracking-wide uppercase" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  id="password" name="password" type={showPw ? "text" : "password"} required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-white pl-11 pr-11 py-3.5 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm shadow-sm"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-accent transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div {...fadeUp(0.46)}>
              <motion.button
                type="submit" disabled={submitting}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(201,162,39,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all disabled:opacity-60 mt-1"
                style={{ background: "linear-gradient(135deg, #0B1F33 0%, #1a3a5c 100%)", color: "#fff" }}
              >
                <LogIn className="w-4 h-4" />
                {submitting ? "Signing in…" : "Sign in"}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div {...fadeUp(0.52)} className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-secondary/50">or continue as</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          <motion.div {...fadeUp(0.58)} className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3 text-sm font-medium text-primary hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm">
              🛍️ Browse as Guest
            </Link>
            <Link to="/register?role=shop_owner" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3 text-sm font-medium text-primary hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm">
              🏪 List My Shop
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
