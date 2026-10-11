import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "shopsphere_location";

/**
 * Persists { coords: { latitude, longitude }, label } in localStorage.
 * GPS locate() also saves the result. Clearing removes it from storage.
 */
export function usePersistedLocation() {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { coords: null, label: "" };
    } catch {
      return { coords: null, label: "" };
    }
  });
  const [locating, setLocating] = useState(false);

  const save = useCallback((coords, label) => {
    const next = { coords, label };
    setLocation(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = "Your location";
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const d = await r.json();
          const a = d.address;
          label = a.suburb || a.neighbourhood || a.city_district || a.town || a.city || "Your location";
        } catch {}
        save({ latitude, longitude }, label);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [save]);

  const clear = useCallback(() => {
    setLocation({ coords: null, label: "" });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { coords: location.coords, label: location.label, locating, locate, save, clear };
}
