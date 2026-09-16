import { useNavigate } from "react-router-dom";
import { Store, Package, Star, Phone, BarChart2, ShieldCheck, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

const FEATURES = [
  { icon: Store, title: "Free Digital Storefront", desc: "Create your shop profile with photos, description, location, and opening hours — completely free." },
  { icon: Package, title: "Product Catalog", desc: "List your products with prices, images, sizes, and availability so customers know what to expect." },
  { icon: Phone, title: "Direct Customer Contact", desc: "Customers can call, WhatsApp, or get directions to your shop straight from your listing." },
  { icon: Star, title: "Reviews & Ratings", desc: "Build trust with genuine customer reviews that show up on your public shop page." },
  { icon: BarChart2, title: "Product Views", desc: "See how many times your products are being viewed so you know what's attracting interest." },
  { icon: ShieldCheck, title: "Verified Badge", desc: "Get a verified badge from our team to stand out and build customer confidence." },
];

const STEPS = [
  { step: "01", title: "Register", desc: "Create a free account as a Shop Owner." },
  { step: "02", title: "Create your shop", desc: "Add your shop details, photos, and location." },
  { step: "03", title: "Add products", desc: "List what you sell with prices and availability." },
  { step: "04", title: "Get discovered", desc: "Customers searching nearby will find you." },
];

export default function ForBusiness() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/[0.05] to-transparent">
        <div className="container-app py-16 sm:py-24 text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight">
            Grow your local business with ShopSphere
          </h1>
          <p className="text-secondary text-lg mt-5">
            List your shop for free and reach customers who are already searching for what you sell
            — right in your neighbourhood.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button icon={Store} size="lg" onClick={() => navigate("/register")}>
              List Your Shop — Free
            </Button>
            <Button variant="outline" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/login")}>
              I already have an account
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-app py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-10">
          Everything you need to get found
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-border rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <p className="font-semibold text-primary">{title}</p>
              <p className="text-sm text-secondary mt-1.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border">
        <div className="container-app py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-12">
            Up and running in minutes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step}>
                <span className="font-display text-3xl font-bold text-accent/30">{step}</span>
                <p className="font-semibold text-primary mt-2">{title}</p>
                <p className="text-sm text-secondary mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-16 sm:py-20 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-primary max-w-xl mx-auto">
          Your shop deserves to be discovered.
        </h2>
        <p className="text-secondary mt-3 max-w-md mx-auto">
          Join ShopSphere today — it's free, and takes less than 5 minutes to set up.
        </p>
        <Button icon={Store} size="lg" className="mt-8" onClick={() => navigate("/register")}>
          Get Started for Free
        </Button>
      </section>
    </div>
  );
}
