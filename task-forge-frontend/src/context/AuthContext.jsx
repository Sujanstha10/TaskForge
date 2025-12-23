import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      // In a real app, strict validation or a /me endpoint call would happen here
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback if we have token but no user data (shouldn't happen ideally)
        setUser({ email: "User" });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.status) {
        const { accessToken } = response.data.data;
        localStorage.setItem("token", accessToken);

        // Since we don't have a /me endpoint yet, we'll store the email locally
        // to show in the UI.
        const userData = { email };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.status) {
        const { accessToken } = response.data.data;
        localStorage.setItem("token", accessToken);

        const userData = { email, name };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || response.data.message,
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
