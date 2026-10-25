import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

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

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/profile");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/user/login", { email, password });
    setUser(res.data);
    return res.data;
  };

  const signup = async (name, email, password, age) => {
    const payload = { name, email, password };
    if (age) payload.age = Number(age);
    const res = await api.post("/user/signup", payload);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await api.post("/user/logout");
    setUser(null);
  };

  const updateUsage = (newUsage) => {
    setUser((prev) => (prev ? { ...prev, usage: newUsage } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUsage }}>
      {children}
    </AuthContext.Provider>
  );
};
