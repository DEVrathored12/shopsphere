import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import { cn } from "../lib/cn";

/**
 * Shared shell for the customer/owner/admin dashboard areas: navbar on
 * top, a section sidebar, content on the right. On mobile the sidebar
 * becomes a slide-in drawer triggered by a "Menu" button, per the
 * "responsive sidebar/drawer" requirement.
 *
 * `links` entries are either a route ({ to, label, icon, end }) or an
 * action ({ label, icon, onClick }, e.g. Logout) — anything without
 * `to` renders as a button instead of a NavLink.
 */
export default function DashboardShell({ heading, links }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container-app py-6 sm:py-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-lg border border-border bg-white text-sm font-medium text-primary"
        >
          <Menu className="w-4 h-4" /> {heading || "Menu"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
            {heading && <p className="text-xs font-semibold text-secondary uppercase tracking-wide px-3 mb-2">{heading}</p>}
            <SidebarNav links={links} />
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {drawerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setDrawerOpen(false);
            }}
          >
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-lg p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                {heading && <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{heading}</p>}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background"
                >
                  <X className="w-4 h-4 text-secondary" />
                </button>
              </div>
              <SidebarNav links={links} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function SidebarNav({ links, onNavigate }) {
  const itemClass = "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors";

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) =>
        link.to ? (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) => cn(itemClass, isActive ? "bg-accent/10 text-accent" : "text-primary hover:bg-white")}
          >
            {link.icon && <link.icon className="w-4 h-4" />}
            {link.label}
          </NavLink>
        ) : (
          <button
            key={link.label}
            type="button"
            onClick={() => {
              link.onClick?.();
              onNavigate?.();
            }}
            className={cn(itemClass, "text-danger hover:bg-danger/5 text-left")}
          >
            {link.icon && <link.icon className="w-4 h-4" />}
            {link.label}
          </button>
        )
      )}
    </nav>
  );
}
