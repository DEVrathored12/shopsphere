import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-app py-24 text-center">
      <p className="text-6xl font-display font-bold text-accent">404</p>
      <h1 className="text-2xl font-semibold text-primary mt-3">Page not found</h1>
      <p className="text-secondary mt-2">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/">
        <Button className="mt-6">Back to Home</Button>
      </Link>
    </div>
  );
}
