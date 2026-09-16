/**
 * Formats a product price for display according to its priceType.
 * Never invents a number — "contact_shop" products have no price.
 */
export function formatPrice(product) {
  if (!product) return "";
  if (product.priceType === "contact_shop") return "Contact for price";
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price ?? 0);
  return product.priceType === "starting_from" ? `From ${amount}` : amount;
}

/**
 * Formats a distance in kilometers for display. Returns null when no
 * distance is available so callers can omit the UI entirely rather
 * than showing a fabricated value.
 */
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || Number.isNaN(distanceKm)) {
    return null;
  }
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/**
 * Determines whether a shop is currently open based on its
 * openingHours map and the viewer's local time.
 */
export function isShopOpenNow(openingHours) {
  if (!openingHours) return null;
  const now = new Date();
  const dayKey = DAY_ORDER[(now.getDay() + 6) % 7]; // Date#getDay is 0=Sun
  const today = openingHours[dayKey];
  if (!today || today.isClosed || !today.open || !today.close) return false;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (Number.isNaN(openMinutes) || Number.isNaN(closeMinutes)) return null;
  return minutesNow >= openMinutes && minutesNow <= closeMinutes;
}

/** Builds a sanitized wa.me URL from a raw phone number and optional text. */
export function buildWhatsAppUrl(phone, text = "") {
  const digits = (phone || "").replace(/[^\d]/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Builds a Google Maps directions URL from coordinates or an address string. */
export function buildDirectionsUrl({ latitude, longitude, address } = {}) {
  if (latitude && longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || "")}`;
}
