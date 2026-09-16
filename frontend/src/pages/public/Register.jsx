import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210", required: false },
  { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-primary">ShopSphere</h1>
          <p className="text-secondary text-sm mt-1">Join thousands of local shops and customers.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="bg-white border border-border rounded-2xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-primary mb-6">Create your account</h2>

          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-5 rounded-lg bg-danger/10 text-danger text-sm px-3 py-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <ul className="space-y-0.5">{errors.map((msg) => <li key={msg}>{msg}</li>)}</ul>
            </motion.div>
          )}

          {FIELDS.map(({ name, label, type, placeholder, required = true }) => (
            <div key={name} className="mb-4">
              <label className="block text-sm font-medium text-primary mb-1.5" htmlFor={name}>{label}</label>
              <input
                id={name} name={name} type={type}
                required={required}
                placeholder={placeholder}
                value={form[name]} onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent transition"
              />
            </div>
          ))}

          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="role">I am a</label>
            <select
              id="role" name="role" value={form.role} onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-accent transition"
            >
              <option value="customer">Customer</option>
              <option value="shop_owner">Shop Owner</option>
            </select>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent text-white font-semibold py-2.5 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <p className="mt-5 text-sm text-secondary text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
