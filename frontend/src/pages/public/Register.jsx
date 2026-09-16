import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { UserPlus, AlertCircle, Store, Eye, EyeOff, User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const STATE_MACHINE = "Login Machine";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const orbs = [
  { w: 280, h: 280, bottom: "-60px", left: "-60px", opacity: 0.1, delay: 0 },
  { w: 180, h: 180, top: "30px", right: "-40px", opacity: 0.07, delay: 0.25 },
  { w: 100, h: 100, top: "55%", left: "40%", opacity: 0.05, delay: 0.45 },
];

const FIELDS = [
  { name: "name",            label: "Full name",        type: "text",     placeholder: "John Doe",           icon: User,        required: true },
  { name: "email",           label: "Email address",    type: "email",    placeholder: "you@example.com",    icon: Mail,        required: true },
  { name: "phone",           label: "Phone (optional)", type: "tel",      placeholder: "+91 98765 43210",    icon: Phone,       required: false },
  { name: "password",        label: "Password",         type: "password", placeholder: "Min. 8 characters",  icon: Lock,        required: true },
  { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••",           icon: ShieldCheck, required: true },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", role: "customer" });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState({ password: false, confirmPassword: false });

  // ── Rive setup ──
  const { rive, RiveComponent } = useRive({
    src: "/login_character.riv",
    stateMachines: STATE_MACHINE,
    artboard: "Teddy",
    autoplay: true,
  });
  const isChecking  = useStateMachineInput(rive, STATE_MACHINE, "isChecking");
  const isHandsUp   = useStateMachineInput(rive, STATE_MACHINE, "isHandsUp");
  const trigSuccess = useStateMachineInput(rive, STATE_MACHINE, "trigSuccess");
  const trigFail    = useStateMachineInput(rive, STATE_MACHINE, "trigFail");
  const numLook     = useStateMachineInput(rive, STATE_MACHINE, "numLook");

  // ── Character touch / hover handlers ──
  const riveContainerRef = useRef(null);
  const tapCount = useRef(0);
  const pokeTimer = useRef(null);

  const handleCharacterPointer = (e) => {
    if (!riveContainerRef.current || !numLook) return;
    if (isHandsUp?.value || isChecking?.value) return;
    const rect = riveContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    numLook.value = Math.round(((clientX - rect.left) / rect.width) * 100);
  };

  const handleCharacterClick = () => {
    const cycle = tapCount.current % 3;
    tapCount.current += 1;
    clearTimeout(pokeTimer.current);
    if (cycle === 0 && trigSuccess) {
      trigSuccess.fire();
    } else if (cycle === 1 && trigFail) {
      trigFail.fire();
    } else if (isChecking) {
      isChecking.value = true;
      pokeTimer.current = setTimeout(() => { if (isChecking) isChecking.value = false; }, 800);
    }
  };

  const handleCharacterLeave = () => {
    if (isChecking?.value || isHandsUp?.value) return;
    if (numLook) numLook.value = 50;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "name" || name === "email" || name === "phone") {
      if (numLook) numLook.value = Math.min(value.length * 2.5, 100);
    }
  };
  const togglePw = (field) => setShowPw((v) => ({ ...v, [field]: !v[field] }));

  const handleTextFocus = () => { if (isChecking) isChecking.value = true; if (isHandsUp) isHandsUp.value = false; };
  const handleTextBlur  = () => { if (isChecking) isChecking.value = false; };
  const handlePwFocus   = () => { if (isHandsUp) isHandsUp.value = true; if (isChecking) isChecking.value = false; };
  const handlePwBlur    = () => { if (isHandsUp) isHandsUp.value = false; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const u = await register(form);
      if (trigSuccess) trigSuccess.fire();
      setTimeout(() => navigate(u.role === "shop_owner" ? "/owner/dashboard" : "/dashboard", { replace: true }), 1200);
    } catch (err) {
      if (trigFail) trigFail.fire();
      setErrors(err.errors?.length ? err.errors : [err.message || "Registration failed"]);
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
        className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: "linear-gradient(135deg, #0B1F33 0%, #122d4a 60%, #0f2640 100%)" }}
      >
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
          <motion.h2 {...fadeUp(0.3)} className="font-display text-4xl font-bold text-white leading-[1.2]">
            Join the local<br />
            <span className="text-accent italic">shopping revolution.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.42)} className="text-white/50 text-sm leading-relaxed max-w-xs">
            Free to join. No credit card required. Start discovering or listing in minutes.
          </motion.p>

          {/* Steps */}
          <motion.div {...fadeUp(0.52)} className="space-y-3 pt-2">
            {[
              { step: "01", text: "Create your free account" },
              { step: "02", text: "Set up your shop or profile" },
              { step: "03", text: "Connect with your community" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                  {step}
                </span>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p {...fadeUp(0.6)} className="relative text-white/20 text-xs">
          © {new Date().getFullYear()} ShopSphere · All rights reserved
        </motion.p>
      </motion.div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto relative">
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: "radial-gradient(circle, #C9A227, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-[420px] py-4"
        >
          {/* Mobile logo */}
          <motion.div {...fadeUp(0)} className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xl font-bold text-primary">Shop<span className="text-accent">Sphere</span></span>
          </motion.div>

          {/* Rive character */}
          <div
            ref={riveContainerRef}
            className="w-48 h-48 mx-auto cursor-pointer select-none"
            onMouseMove={handleCharacterPointer}
            onMouseLeave={handleCharacterLeave}
            onTouchMove={handleCharacterPointer}
            onClick={handleCharacterClick}
            onTouchEnd={handleCharacterClick}
          >
            <RiveComponent />
          </div>

          <motion.div {...fadeUp(0.2)} className="text-center mb-2">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-1">Get started</p>
            <h1 className="font-display text-3xl font-bold text-primary mb-1">Create account</h1>
            <p className="text-secondary text-sm">Already have one?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">Sign in →</Link>
            </p>
          </motion.div>

          {/* Role selector */}
          <motion.div {...fadeUp(0.28)} className="mt-7">
            <p className="text-xs font-semibold tracking-wide uppercase text-primary mb-3">I want to</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "customer",   label: "Shop & Discover", emoji: "🛍️", sub: "Browse local shops" },
                { value: "shop_owner", label: "List My Shop",    emoji: "🏪", sub: "Reach more customers" },
              ].map(({ value, label, emoji, sub }) => (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: value }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 py-4 px-3 text-sm font-medium transition-all overflow-hidden ${
                    form.role === value
                      ? "border-accent bg-accent/8 text-accent shadow-md"
                      : "border-border text-secondary hover:border-accent/40 bg-white"
                  }`}
                >
                  {form.role === value && (
                    <motion.div
                      layoutId="roleHighlight"
                      className="absolute inset-0 bg-accent/5 rounded-2xl"
                    />
                  )}
                  <span className="text-2xl relative">{emoji}</span>
                  <span className="font-semibold relative">{label}</span>
                  <span className="text-xs opacity-60 relative">{sub}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 mt-5 rounded-2xl bg-danger/10 text-danger text-sm px-4 py-3 border border-danger/20"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <ul className="space-y-0.5">{errors.map((msg) => <li key={msg}>{msg}</li>)}</ul>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {FIELDS.map(({ name, label, type, placeholder, icon: Icon, required }, i) => {
              const isPw = type === "password";
              const visible = showPw[name];
              return (
                <motion.div key={name} {...fadeUp(0.32 + i * 0.07)}>
                  <label className="block text-xs font-semibold text-primary mb-2 tracking-wide uppercase" htmlFor={name}>
                    {label}
                  </label>
                  <div className="relative group">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                    <input
                      id={name} name={name}
                      type={isPw ? (visible ? "text" : "password") : type}
                      required={required}
                      placeholder={placeholder}
                      value={form[name]}
                      onChange={handleChange}
                      onFocus={isPw ? handlePwFocus : handleTextFocus}
                      onBlur={isPw ? handlePwBlur : handleTextBlur}
                      className="w-full rounded-2xl border border-border bg-white pl-11 pr-11 py-3.5 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm shadow-sm"
                    />
                    {isPw && (
                      <button type="button" onClick={() => togglePw(name)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-accent transition-colors">
                        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <motion.div {...fadeUp(0.7)}>
              <motion.button
                type="submit" disabled={submitting}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(201,162,39,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all disabled:opacity-60 mt-2"
                style={{ background: "linear-gradient(135deg, #0B1F33 0%, #1a3a5c 100%)", color: "#fff" }}
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? "Creating account…" : "Create free account"}
              </motion.button>
            </motion.div>
          </form>

          <motion.p {...fadeUp(0.75)} className="mt-6 text-center text-xs text-secondary/50">
            By signing up you agree to our{" "}
            <span className="text-accent cursor-pointer hover:underline">Terms</span> &{" "}
            <span className="text-accent cursor-pointer hover:underline">Privacy Policy</span>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
