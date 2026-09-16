import User from "../models/User.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";

const toSafeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;
  return user;
};

/**
 * PUT /api/users/me
 * Updates the current user's own profile fields. Email and role are
 * intentionally not editable here — email changes would need
 * re-verification, and role changes are an admin action.
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (avatar !== undefined) req.user.avatar = avatar;

    await req.user.save();

    return sendSuccess(res, { message: "Profile updated", data: { user: toSafeUser(req.user) } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/me/password
 * Requires the current password to prevent a hijacked session from
 * locking the real owner out.
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(401, "Current password is incorrect");

    user.password = newPassword; // re-hashed by the pre-save hook
    await user.save();

    return sendSuccess(res, { message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
