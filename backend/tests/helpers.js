import User from "../src/models/User.js";
import { generateToken } from "../src/utils/jwt.js";

let counter = 0;

export const createUser = async (overrides = {}) => {
  counter += 1;
  const user = await User.create({
    name: overrides.name || `Test User ${counter}`,
    email: overrides.email || `user${counter}@example.com`,
    password: overrides.password || "password123",
    role: overrides.role || "customer",
    phone: overrides.phone || "9876543210",
  });
  const token = generateToken({ userId: user._id, role: user.role });
  return { user, token };
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
