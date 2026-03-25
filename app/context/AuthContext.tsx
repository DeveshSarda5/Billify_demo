import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, AuthResponse, User } from "../services/api";

type AuthContextType = {
  isLoggedIn: boolean;
  isGuest: boolean;
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
  guestLogin: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshProfile: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  // OTP verification
  phoneVerified: boolean;
  setPhoneVerified: (verified: boolean) => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Restore auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userDataStr = await AsyncStorage.getItem("user");
        const isGuestMode = await AsyncStorage.getItem("isGuest");

        if (isGuestMode === "true") {
          // Restore guest mode
          setIsGuest(true);
          setIsLoggedIn(true);
          if (userDataStr) {
            setUser(JSON.parse(userDataStr));
          }
        } else if (token) {
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

  // LOGIN
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
      await AsyncStorage.removeItem("isGuest"); // Clear guest mode

      setUser(userData);
      setIsLoggedIn(true);
      setIsGuest(false);
    } catch (error) {
      throw error;
    }
  };

  // GUEST LOGIN
  const guestLogin = async () => {
    try {
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        name: "Guest User",
        email: "",
        phone: "",
        location: undefined,
      };

      await AsyncStorage.setItem("user", JSON.stringify(guestUser));
      await AsyncStorage.setItem("isGuest", "true");
      await AsyncStorage.removeItem("token"); // Remove auth token

      setUser(guestUser);
      setIsLoggedIn(true);
      setIsGuest(true);
    } catch (error) {
      throw error;
    }
  };

  // SIGNUP
  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const response = (await authAPI.signup({
        ...data,
        phone: data.phone || "",
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
      await AsyncStorage.removeItem("isGuest"); // Clear guest mode

      setUser(userData);
      setIsLoggedIn(true);
      setIsGuest(false);
    } catch (error) {
      throw error;
    }
  };

  // LOGOUT
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("isGuest");

    setUser(null);
    setIsLoggedIn(false);
    setIsGuest(false);
    setPhoneVerified(false);
  };

  // SEND EMAIL VERIFICATION
  const sendEmailVerification = async () => {
    if (!user?.email) throw new Error("No email found");
    try {
      await authAPI.resendVerificationEmail(user.email);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isGuest,
        user,
        loading,
        login,
        signup,
        logout,
        guestLogin,
        setUser,
        refreshProfile,
        sendEmailVerification,
        phoneVerified,
        setPhoneVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
