import { Link } from "react-router-dom";
import { Store } from "lucide-react";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Shops", to: "/explore" },
      { label: "Categories", to: "/categories" },
      { label: "Products", to: "/explore" },
    ],
  },
  {
    heading: "For Business",
    links: [
      { label: "List Your Shop", to: "/for-business" },
      { label: "Owner Login", to: "/login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Tutorial", to: "/tutorial" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="container-app py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Store className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-lg font-semibold text-primary">ShopSphere</span>
          </div>
          <p className="text-sm text-secondary mt-3 max-w-[220px]">
            Discover Local. See More. Visit Smarter.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="text-sm font-semibold text-primary mb-3">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-secondary hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-app py-4 text-xs text-secondary text-center">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
