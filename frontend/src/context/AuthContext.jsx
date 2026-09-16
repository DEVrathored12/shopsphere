import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  registerUser,
  loginUser,
  fetchCurrentUser,
} from "../services/authService";
import { getToken, setToken, clearToken } from "../services/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first mount, if a token exists, try to resolve it to a user.
  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        setUser(me);
      } catch {
        // Token invalid/expired — clear it silently.
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { user: loggedInUser, token } = await loginUser({ email, password });
    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, token } = await registerUser(payload);
    setToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Lets pages that edit the profile (e.g. Profile.jsx) refresh the
  // cached user in place, without a full re-fetch or reload — so the
  // navbar avatar/name reflect an edit immediately.
  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
