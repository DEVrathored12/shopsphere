import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const newUser = await register(form);
      const dest =
        newUser.role === "shop_owner" ? "/owner/dashboard" : "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Registration failed"]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-border rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-primary mb-6">Create your account</h1>

        {errors.length > 0 && (
          <ul className="mb-4 text-sm text-danger space-y-1" role="alert">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        )}

        {[
          { name: "name", label: "Full name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "tel" },
          { name: "password", label: "Password", type: "password" },
          { name: "confirmPassword", label: "Confirm password", type: "password" },
        ].map(({ name, label, type }) => (
          <div key={name} className="mb-4">
            <label className="block text-sm text-secondary mb-1" htmlFor={name}>
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              required={name !== "phone"}
              value={form[name]}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        ))}

        <div className="mb-6">
          <label className="block text-sm text-secondary mb-1" htmlFor="role">
            I am a
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-border px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="customer">Customer</option>
            <option value="shop_owner">Shop owner</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent text-white font-medium py-2.5 transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-sm text-secondary text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
