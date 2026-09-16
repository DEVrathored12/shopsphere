import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Users, Store, Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";

const PILLARS = [
  { icon: Compass, title: "Discover Local", desc: "Find shops and products right around the corner — before you make the trip." },
  { icon: Store, title: "Support Small Business", desc: "Every search on ShopSphere puts a local shop in front of a nearby customer." },
  { icon: Users, title: "Community First", desc: "Built for the neighbourhoods, markets, and high streets that make cities alive." },
  { icon: Sparkles, title: "See More, Visit Smarter", desc: "Check prices, photos, and availability so you always know what to expect." },
];

const TEAM = [
  {
    name: "Dev Darji",
    role: "Founder & CEO",
    bio: "Visionary behind ShopSphere. Passionate about empowering local businesses with technology.",
    image: "/team/dev.jpeg",
    owner: true,
  },
  {
    name: "Bhavik",
    role: "Backend Developer",
    bio: "Builds the APIs and infrastructure that power ShopSphere.",
    image: "/team/bhavik.jpeg",
  },
  {
    name: "Daksh",
    role: "Frontend Developer",
    bio: "Crafts the user interfaces and experiences customers love.",
    image: "/team/daksh.jpeg",
  },
  {
    name: "Ritesh",
    role: "UI/UX Designer",
    bio: "Designs beautiful, intuitive experiences for shops and customers.",
    image: "/team/ritesh.jpeg",
  },
  {
    name: "Team Member",
    role: "Marketing & Growth",
    bio: "Drives awareness and helps local shops get discovered on ShopSphere.",
    image: "/team/local2.jpeg",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="container-app py-14 sm:py-20 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight"
        >
          About ShopSphere
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-secondary text-lg mt-5 leading-relaxed"
        >
          ShopSphere is a hyperlocal discovery platform that connects local shop owners with nearby
          customers. We believe the best shopping experiences happen close to home — and we're
          building the tools to make that easier for everyone.
        </motion.p>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {PILLARS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-primary">{title}</p>
                <p className="text-sm text-secondary mt-1">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-border bg-white">
        <div className="container-app py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary">Meet the Team</h2>
            <p className="text-secondary mt-3 max-w-xl mx-auto">
              The people building ShopSphere and making local discovery possible.
            </p>
          </motion.div>

          {/* Owner — large card centered */}
          <div className="flex justify-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-background border border-border rounded-3xl p-8 flex flex-col items-center text-center max-w-xs w-full shadow-sm"
            >
              <div className="relative mb-4">
                <img
                  src={TEAM[0].image}
                  alt={TEAM[0].name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-accent/30 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Founder
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-primary">{TEAM[0].name}</h3>
              <p className="text-accent text-sm font-medium mt-0.5">{TEAM[0].role}</p>
              <p className="text-secondary text-sm mt-3 leading-relaxed">{TEAM[0].bio}</p>
            </motion.div>
          </div>

          {/* Rest of team */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {TEAM.slice(1).map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border mb-3"
                />
                <h3 className="font-semibold text-primary text-sm">{member.name}</h3>
                <p className="text-accent text-xs font-medium mt-0.5">{member.role}</p>
                <p className="text-secondary text-xs mt-2 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-14 sm:py-20 max-w-3xl">
        <div className="bg-primary rounded-3xl px-8 py-10 text-center">
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
      </section>
    </div>
  );
}
