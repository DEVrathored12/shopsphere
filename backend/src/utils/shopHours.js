const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/**
 * Whether a shop is open right now (server clock), based on its
 * openingHours map. Mirrors frontend/src/utils/format.js#isShopOpenNow
 * so "Open Now" filtering matches what the badge on the card shows.
 * Returns null when it can't be determined either way.
 */
export const isShopOpenNow = (openingHours) => {
  if (!openingHours) return null;
  const now = new Date();
  const dayKey = DAY_ORDER[(now.getDay() + 6) % 7]; // JS getDay() is 0=Sun
  const today = openingHours[dayKey];
  if (!today || today.isClosed || !today.open || !today.close) return false;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (Number.isNaN(openMinutes) || Number.isNaN(closeMinutes)) return null;
  return minutesNow >= openMinutes && minutesNow <= closeMinutes;
};
