import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, AuthResponse, User } from "../services/api";

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshProfile: () => Promise<void>;
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
        const userDataStr = await AsyncStorage.getItem("user");

        if (token) {
          if (userDataStr) {
            setUser(JSON.parse(userDataStr));
            setIsLoggedIn(true);
          }
          // Always try to get fresh data if token exists
          await refreshProfile();
        }
      } catch (error) {
        console.error("Auth restore failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshProfile = async () => {
    try {
      const freshUser = await authAPI.getMe();
      if (freshUser) {
        setUser(freshUser);
        await AsyncStorage.setItem("user", JSON.stringify(freshUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Profile refresh failed:", error);
    }
  };

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    try {
      const response = (await authAPI.login({
        email,
        password,
      })) as AuthResponse;

      const userData: User = {
        id: response.user.id,
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
    password: string;
    phone?: string;
  }) => {
    try {
      const response = (await authAPI.signup({
        ...data,
        phone: data.phone || '',
      })) as AuthResponse;

      const userData: User = {
        id: response.user.id,
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
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
