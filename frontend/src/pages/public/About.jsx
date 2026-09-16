import { useNavigate } from "react-router-dom";
import { Compass, Users, Store, Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";

const PILLARS = [
  { icon: Compass, title: "Discover Local", desc: "Find shops and products right around the corner — before you make the trip." },
  { icon: Store, title: "Support Small Business", desc: "Every search on ShopSphere puts a local shop in front of a nearby customer." },
  { icon: Users, title: "Community First", desc: "Built for the neighbourhoods, markets, and high streets that make cities alive." },
  { icon: Sparkles, title: "See More, Visit Smarter", desc: "Check prices, photos, and availability so you always know what to expect." },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="container-app py-14 sm:py-20 max-w-3xl">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight">
        About ShopSphere
      </h1>
      <p className="text-secondary text-lg mt-5 leading-relaxed">
        ShopSphere is a hyperlocal discovery platform that connects local shop owners with nearby
        customers. We believe the best shopping experiences happen close to home — and we're
        building the tools to make that easier for everyone.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mt-12">
        {PILLARS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-primary">{title}</p>
              <p className="text-sm text-secondary mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 bg-primary rounded-3xl px-8 py-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-white">Ready to explore?</h2>
        <p className="text-white/70 mt-2 text-sm">Discover local shops and products near you.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Button icon={Compass} onClick={() => navigate("/explore")}>Explore Shops</Button>
          <button
            type="button"
            onClick={() => navigate("/for-business")}
            className="inline-flex items-center justify-center text-sm px-4 py-2.5 rounded-lg font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            List Your Shop
          </button>
        </div>
      </div>
    </div>
  );
}
