import { useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LayoutDashboard, Heart, Clock, User, LogOut, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cn } from "../../lib/cn";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore" },
  { to: "/categories", label: "Categories" },
  { to: "/for-business", label: "For Business" },
  { to: "/about", label: "About" },
  { to: "/tutorial", label: "Tutorial" },
];

function dashboardPathFor(role) {
  if (role === "admin") return "/admin";
  if (role === "shop_owner") return "/owner/dashboard";
  return "/dashboard";
}

function profilePathFor(role) {
  if (role === "shop_owner") return "/owner/profile";
  if (role === "admin") return null;
  return "/profile";
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const profilePath = profilePathFor(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="container-app flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Store className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-lg font-semibold text-primary">ShopSphere</span>
        </Link>

        {/* Desktop nav — pill hover effect */}
        <nav
          className="hidden lg:flex items-center gap-0.5 relative"
          onMouseLeave={() => setHoveredLink(null)}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onMouseEnter={() => setHoveredLink(link.to)}
              className={({ isActive }) =>
                cn(
                  "relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors z-10",
                  isActive ? "text-accent" : "text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Sliding pill background on hover */}
                  {hoveredLink === link.to && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {/* Active underline */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-1 left-3 right-3 h-0.5 bg-accent rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 border border-border hover:bg-background transition-colors"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <ChevronDown className="w-3.5 h-3.5 text-secondary" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-lg py-1.5 overflow-hidden"
                  >
                    <div className="px-3.5 py-2 border-b border-border">
                      <p className="text-sm font-medium text-primary line-clamp-1">{user?.name}</p>
                      <p className="text-xs text-secondary line-clamp-1">{user?.email}</p>
                    </div>
                    <Link to={dashboardPathFor(user?.role)} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-primary hover:bg-background">
                      <LayoutDashboard className="w-4 h-4 text-secondary" /> Dashboard
                    </Link>
                    {user?.role === "customer" && (
                      <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-primary hover:bg-background">
                        <Heart className="w-4 h-4 text-secondary" /> Favorites
                      </Link>
                    )}
                    {user?.role === "customer" && (
                      <Link to="/recently-viewed" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-primary hover:bg-background">
                        <Clock className="w-4 h-4 text-secondary" /> Recently Viewed
                      </Link>
                    )}
                    {profilePath && (
                      <Link to={profilePath} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-primary hover:bg-background">
                        <User className="w-4 h-4 text-secondary" /> Profile
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger hover:bg-background">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-3.5 py-2 text-sm font-medium text-primary hover:text-accent transition-colors">
                Login
              </Link>
              <Button size="md" onClick={() => navigate("/register")}>Register</Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-background"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-white overflow-hidden"
          >
            <div className="container-app py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn("px-3 py-2.5 rounded-lg text-sm font-medium", isActive ? "text-accent bg-accent/5" : "text-primary hover:bg-background")
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-border my-2" />
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPathFor(user?.role)} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-background">Dashboard</Link>
                  {user?.role === "customer" && <Link to="/favorites" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-background">Favorites</Link>}
                  {user?.role === "customer" && <Link to="/recently-viewed" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-background">Recently Viewed</Link>}
                  {profilePath && <Link to={profilePath} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-background">Profile</Link>}
                  <button type="button" onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-background">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 px-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => { setMobileOpen(false); navigate("/login"); }}>Login</Button>
                  <Button className="flex-1" onClick={() => { setMobileOpen(false); navigate("/register"); }}>Register</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
