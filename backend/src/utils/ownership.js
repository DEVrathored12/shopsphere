/**
 * True if the authenticated user is an admin, or is the owner of the
 * resource identified by `ownerId` (a Mongo ObjectId or string).
 * Used to gate edit/delete access consistently across controllers.
 */
export const isOwnerOrAdmin = (user, ownerId) => {
  if (!user || !ownerId) return false;
  if (user.role === "admin") return true;
  return user._id.toString() === ownerId.toString();
};
