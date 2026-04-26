import React, { createContext, useState, useEffect, useCallback } from "react";
import * as apiService from "../services/apiService";

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("crowdpulse_idToken");
    const storedUser = localStorage.getItem("crowdpulse_user");

    if (storedToken && storedUser) {
      setIdToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const signUp = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.signUp(email, password);
      console.log("Sign up response:", response);
      return response;
    } catch (err) {
      const errorMessage = err.message || "Sign up failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.verifyEmail(email, code);
      console.log("Verify response:", response);
      return response;
    } catch (err) {
      const errorMessage = err.message || "Verification failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(email, password);
      const { idToken: token, accessToken } = response;

      // Store tokens and user info
      localStorage.setItem("crowdpulse_idToken", token);
      localStorage.setItem("crowdpulse_accessToken", accessToken);
      localStorage.setItem("crowdpulse_user", JSON.stringify({ email }));

      setIdToken(token);
      setUser({ email });
      setIsAuthenticated(true);

      return response;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("crowdpulse_idToken");
    localStorage.removeItem("crowdpulse_accessToken");
    localStorage.removeItem("crowdpulse_user");

    setIdToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const value = {
    user,
    idToken,
    loading,
    error,
    isAuthenticated,
    signUp,
    verifyEmail,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
