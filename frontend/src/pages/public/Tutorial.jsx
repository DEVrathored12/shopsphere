import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Store, ShoppingBag, Star, Heart, Phone, UserPlus, Package, Images, Compass } from "lucide-react";
import Button from "../../components/ui/Button";

const CUSTOMER_STEPS = [
  { icon: UserPlus, step: "01", title: "Create an Account", desc: "Register as a customer to unlock favorites, reviews, and your personal dashboard." },
  { icon: Search, step: "02", title: "Search for Shops", desc: "Use the search bar to find shops by name, category, or product near your location." },
  { icon: Store, step: "03", title: "Browse Shop Details", desc: "View photos, opening hours, contact info, and the full product catalog before visiting." },
  { icon: ShoppingBag, step: "04", title: "Explore Products", desc: "Check prices, availability, sizes, and colors — all before stepping out." },
  { icon: Heart, step: "05", title: "Save Favorites", desc: "Tap the heart icon to save shops and products you love for quick access later." },
  { icon: Star, step: "06", title: "Leave a Review", desc: "After visiting, share your experience to help other customers discover great shops." },
  { icon: Phone, step: "07", title: "Connect Directly", desc: "Call, WhatsApp, or get directions to the shop straight from the app." },
];

const OWNER_STEPS = [
  { icon: UserPlus, step: "01", title: "Register as Shop Owner", desc: "Sign up and select 'Shop Owner' as your role during registration." },
  { icon: Store, step: "02", title: "Create Your Shop", desc: "Add your shop name, category, description, address, and contact details." },
  { icon: Images, step: "03", title: "Add Photos", desc: "Upload a cover image and gallery photos to make your shop stand out." },
  { icon: Package, step: "04", title: "List Your Products", desc: "Add products with names, prices, photos, and availability status." },
  { icon: Compass, step: "05", title: "Get Discovered", desc: "Your shop is now live — customers nearby can find and contact you directly." },
];

function StepCard({ icon: Icon, step, title, desc, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.4 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        {i < 6 && <div className="w-px flex-1 bg-border mt-2" />}
      </div>
      <div className="pb-8">
        <span className="text-xs font-bold text-accent/60 uppercase tracking-widest">Step {step}</span>
        <h3 className="font-semibold text-primary mt-0.5">{title}</h3>
        <p className="text-sm text-secondary mt-1 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function Tutorial() {
  const navigate = useNavigate();

  return (
    <div className="container-app py-14 sm:py-20 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight">
          How to use ShopSphere
        </h1>
        <p className="text-secondary text-lg mt-4 leading-relaxed">
          Whether you're a customer looking for local shops or a business owner wanting to get discovered — here's everything you need to know.
        </p>
      </motion.div>

      {/* For Customers */}
      <section className="mt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-primary">For Customers</h2>
            <p className="text-sm text-secondary">Discover and connect with local shops</p>
          </div>
        </motion.div>

        <div>
          {CUSTOMER_STEPS.map((s, i) => (
            <StepCard key={s.step} {...s} i={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Button icon={Compass} onClick={() => navigate("/explore")}>Start Exploring</Button>
        </motion.div>
      </section>

      {/* For Shop Owners */}
      <section className="mt-16 pt-16 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-primary">For Shop Owners</h2>
            <p className="text-sm text-secondary">List your shop and reach nearby customers</p>
          </div>
        </motion.div>

        <div>
          {OWNER_STEPS.map((s, i) => (
            <StepCard key={s.step} {...s} i={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Button icon={Store} onClick={() => navigate("/register")}>List Your Shop — Free</Button>
        </motion.div>
      </section>
    </div>
  );
}
