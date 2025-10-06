import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../config/api";
import Cookies from "js-cookie";
import { config } from "../config/environment";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Always try to fetch current user from backend. Backend will use httpOnly cookie
      // (set after Google OAuth) or token-based cookie to identify the user.
      const response = await api.get("/auth/me");
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        // ensure user cleared if not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      Cookies.remove("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;

      Cookies.set("token", token, { expires: 7 });
      localStorage.setItem("token", token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { user, token } = response.data;

      Cookies.set("token", token, { expires: 7 });
      localStorage.setItem("token", token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const googleLogin = () => {
    // Redirect the browser to the backend Google OAuth start URL
    const base = (config && config.API_BASE_URL) || window.location.origin;
    const url = base.replace(/\/$/, "") + "/auth/google";
    window.location.href = url;
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("token");
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
