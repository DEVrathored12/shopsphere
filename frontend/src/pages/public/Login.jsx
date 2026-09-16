import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { LogIn, Mail, Lock, AlertCircle, Store, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const STATE_MACHINE = "Login Machine";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // ── Rive setup ──
  const { rive, RiveComponent } = useRive({
    src: "/login_character.riv",
    stateMachines: STATE_MACHINE,
    artboard: "Teddy",
    autoplay: true,
  });

  const isChecking  = useStateMachineInput(rive, STATE_MACHINE, "isChecking");
  const isHandsUp   = useStateMachineInput(rive, STATE_MACHINE, "isHandsUp");
  const isSuccess   = useStateMachineInput(rive, STATE_MACHINE, "isSuccess");
  const numLook     = useStateMachineInput(rive, STATE_MACHINE, "numLook");

  // ── Character touch / hover handlers ──
  const riveContainerRef = useRef(null);
  const pokeTimer = useRef(null);

  const handleCharacterPointer = (e) => {
    if (!riveContainerRef.current || !numLook) return;
    // Only react when no form field is active
    if (isHandsUp?.value || isChecking?.value) return;
    const rect = riveContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = (clientX - rect.left) / rect.width; // 0 → 1
    numLook.value = Math.round(x * 100);
  };

  const handleCharacterClick = () => {
    if (isHandsUp?.value) return;
    // Quick peek: isChecking on → off after 600ms
    if (isChecking) {
      isChecking.value = true;
      clearTimeout(pokeTimer.current);
      pokeTimer.current = setTimeout(() => { if (isChecking) isChecking.value = false; }, 600);
    }
  };

  const handleCharacterLeave = () => {
    if (isChecking?.value || isHandsUp?.value) return;
    // Reset eyes to centre
    if (numLook) numLook.value = 50;
  };

  // ── Input handlers ──
  const handleEmailFocus = () => {
    if (isChecking)  isChecking.value  = true;
    if (isHandsUp)   isHandsUp.value   = false;
  };
  const handleEmailBlur = () => {
    if (isChecking) isChecking.value = false;
  };
  const handleEmailChange = (e) => {
    setForm((f) => ({ ...f, email: e.target.value }));
    // Move eyes based on how many chars typed (0–100 mapped to 0–100)
    if (numLook) numLook.value = Math.min(e.target.value.length * 2.5, 100);
  };
  const handlePasswordFocus = () => {
    if (isHandsUp)  isHandsUp.value  = true;
    if (isChecking) isChecking.value = false;
  };
  const handlePasswordBlur = () => {
    if (isHandsUp) isHandsUp.value = false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await login(form);
      if (isSuccess) isSuccess.value = true;
      setTimeout(() => {
        const from = location.state?.from?.pathname;
        const fallback = u.role === "admin" ? "/admin" : u.role === "shop_owner" ? "/owner/dashboard" : "/dashboard";
        const prefix   = u.role === "admin" ? "/admin" : u.role === "shop_owner" ? "/owner" : "/";
        navigate(from?.startsWith(prefix) ? from : fallback, { replace: true });
      }, 1200);
    } catch (err) {
      if (isSuccess) isSuccess.value = false;
      setError(err.message || "Login failed. Please check your credentials.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left branding panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: "linear-gradient(135deg,#0B1F33 0%,#122d4a 60%,#0f2640 100%)" }}
      >
        {/* Orbs */}
        {[
          { w:320, h:320, top:"-80px",  left:"-80px",  op:0.12, d:0   },
          { w:200, h:200, bottom:"60px", right:"-60px", op:0.08, d:0.2 },
          { w:120, h:120, top:"45%",    left:"55%",    op:0.06, d:0.4 },
        ].map((o,i) => (
          <motion.div key={i}
            initial={{ scale:0.6, opacity:0 }}
            animate={{ scale:1, opacity:o.op }}
            transition={{ delay:o.d, duration:1.2, ease:"easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{ width:o.w, height:o.h, top:o.top, left:o.left, bottom:o.bottom, right:o.right,
              background:"radial-gradient(circle,#C9A227,transparent 70%)" }}
          />
        ))}
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Logo */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.5}}
          className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Shop<span className="text-accent">Sphere</span>
          </span>
        </motion.div>

        {/* Copy */}
        <div className="relative space-y-5">
          <motion.h2 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.5}}
            className="font-display text-5xl font-bold text-white leading-[1.15]">
            Discover Local.<br />
            <span className="text-accent italic">See More.</span><br />
            Visit Smarter.
          </motion.h2>
          <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45,duration:0.5}}
            className="text-white/50 text-base leading-relaxed max-w-xs">
            Your neighbourhood, fully explored — shops, products, prices, all before you step outside.
          </motion.p>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.55,duration:0.5}}
            className="flex gap-3 pt-2">
            {[{v:"500+",l:"Local Shops"},{v:"10k+",l:"Products"},{v:"4.8★",l:"Avg Rating"}].map(({v,l})=>(
              <div key={l} className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-accent font-bold text-lg leading-none">{v}</p>
                <p className="text-white/40 text-xs mt-1">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
          className="relative text-white/20 text-xs">
          © {new Date().getFullYear()} ShopSphere · All rights reserved
        </motion.p>
      </motion.div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-y-auto">
        {/* Subtle bg blob */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background:"radial-gradient(circle,#C9A227,transparent 70%)", transform:"translate(30%,-30%)" }} />

        <motion.div
          initial={{ opacity:0, y:32 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, delay:0.15, ease:"easeOut" }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xl font-bold text-primary">Shop<span className="text-accent">Sphere</span></span>
          </div>

          {/* ── Rive character ── */}
          <div
            ref={riveContainerRef}
            className="w-48 h-48 mx-auto mb-2 cursor-pointer select-none"
            onMouseMove={handleCharacterPointer}
            onMouseLeave={handleCharacterLeave}
            onTouchMove={handleCharacterPointer}
            onClick={handleCharacterClick}
            onTouchEnd={handleCharacterClick}
          >
            <RiveComponent />
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-1">Welcome back</p>
            <h1 className="font-display text-3xl font-bold text-primary">Sign in</h1>
            <p className="text-secondary text-sm mt-1">
              No account?{" "}
              <Link to="/register" className="text-accent font-semibold hover:underline">Create one free →</Link>
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity:0, y:-8, height:0 }}
                animate={{ opacity:1, y:0, height:"auto" }}
                exit={{ opacity:0, height:0 }}
                className="flex items-start gap-2 mb-5 rounded-2xl bg-danger/10 text-danger text-sm px-4 py-3 border border-danger/20"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-2 tracking-wide uppercase" htmlFor="email">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  id="email" name="email" type="email" required
                  value={form.email}
                  onChange={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-border bg-white pl-11 pr-4 py-3.5 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-2 tracking-wide uppercase" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  id="password" name="password" type={showPw ? "text" : "password"} required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-white pl-11 pr-11 py-3.5 text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm shadow-sm"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-accent transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={submitting}
              whileHover={{ scale:1.02, boxShadow:"0 8px 30px rgba(201,162,39,0.35)" }}
              whileTap={{ scale:0.97 }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm transition-all disabled:opacity-60"
              style={{ background:"linear-gradient(135deg,#0B1F33 0%,#1a3a5c 100%)", color:"#fff" }}
            >
              <LogIn className="w-4 h-4" />
              {submitting ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          {/* Quick links */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-secondary/50">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3 text-sm font-medium text-primary hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm">
              🛍️ Browse as Guest
            </Link>
            <Link to="/register" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3 text-sm font-medium text-primary hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm">
              🏪 List My Shop
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
