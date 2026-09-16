const EARTH_RADIUS_KM = 6371;

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two lat/lng points, in kilometers.
 * Returns null if any coordinate is missing/invalid so callers never
 * fabricate a distance for a shop with no location set.
 */
export const haversineKm = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== "number" || Number.isNaN(v))) {
    return null;
  }
  if ((lat1 === 0 && lon1 === 0) || (lat2 === 0 && lon2 === 0)) {
    // [0, 0] is the schema default for "no location set" — treat as absent
    // rather than reporting a (meaningless) distance to Null Island.
    return null;
  }

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Parses ?lat & ?lng query params into a { latitude, longitude } pair,
 * or null if either is missing/invalid.
 */
export const parseCoords = (query = {}) => {
  const latitude = parseFloat(query.lat);
  const longitude = parseFloat(query.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
};
