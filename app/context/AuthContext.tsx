import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, AuthResponse } from "../services/api";

type User = {
  name: string;
  email: string;
  phone: string;
  location?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Auth restore failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    try {
      const response = (await authAPI.login({
        email,
        password,
      })) as AuthResponse;

      const userData: User = {
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        location: response.user.location,
      };

      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };

  // 📝 SIGNUP
  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = (await authAPI.signup(data)) as AuthResponse;

      const userData: User = {
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        location: response.user.location,
      };

      // Auto-login after signup
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };

  // 🔓 LOGOUT
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
