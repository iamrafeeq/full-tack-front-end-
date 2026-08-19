import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const handleDeactivated = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setToken(null);
      setRole(null);
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("auth:deactivated", handleDeactivated);
    return () => window.removeEventListener("auth:deactivated", handleDeactivated);
  }, [navigate]);

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(userToken);
    setRole(userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("hasBookings");

    setToken(null);
    setRole(null);
    setUser(null);

    navigate("/login");
  };

  const value = {
    user,
    role,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}