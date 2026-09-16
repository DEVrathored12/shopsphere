import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle, Store, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PERKS = [
  { icon: ShoppingBag, text: "Browse 1000s of local products" },
  { icon: Users, text: "Join a growing local community" },
  { icon: TrendingUp, text: "List your shop for free" },
];

const FIELDS = [
  { name: "name", label: "Full name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
  { name: "phone", label: "Phone (optional)", type: "tel", placeholder: "+91 98765 43210", required: false },
  { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
  { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", role: "customer" });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const newUser = await register(form);
      navigate(newUser.role === "shop_owner" ? "/owner/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Registration failed"]);
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
        className="hidden lg:flex lg:w-5/12 bg-primary flex-col justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-white">Shop</span>
            <span className="text-xl font-bold text-accent">Sphere</span>
          </div>
        </div>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display text-3xl font-bold text-white leading-tight mb-4"
          >
            Join the local<br />
            <span className="text-accent">shopping revolution.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white/60 text-sm mb-8"
          >
            Free to join. No credit card required.
          </motion.p>
          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, text }, i) => (
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

        <p className="relative text-white/30 text-xs">© {new Date().getFullYear()} ShopSphere</p>
      </motion.div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 overflow-y-auto">
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

          <h1 className="font-display text-3xl font-bold text-primary mb-1">Create account</h1>
          <p className="text-secondary text-sm mb-8">It's free and takes less than a minute.</p>

          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-6 rounded-xl bg-danger/10 text-danger text-sm px-4 py-3 border border-danger/20"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <ul className="space-y-0.5">{errors.map((msg) => <li key={msg}>{msg}</li>)}</ul>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map(({ name, label, type, placeholder, required = true }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-primary mb-1.5" htmlFor={name}>{label}</label>
                <input
                  id={name} name={name} type={type}
                  required={required}
                  placeholder={placeholder}
                  value={form[name]} onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition text-sm"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "customer", label: "Shop & Discover", emoji: "🛍️" },
                  { value: "shop_owner", label: "List My Shop", emoji: "🏪" },
                ].map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-sm font-medium transition-all ${
                      form.role === value
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-secondary hover:border-accent/50"
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit" disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold py-3 transition hover:bg-primary/90 disabled:opacity-60 text-sm mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Creating account…" : "Create free account"}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
