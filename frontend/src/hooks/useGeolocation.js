import { useCallback, useState } from "react";

/**
 * Wraps the browser Geolocation API with loading/error state. Nothing
 * is requested until `locate()` is called (e.g. from a "Use my
 * location" button) — never on mount.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Unable to fetch your location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { coords, error, loading, locate };
}
