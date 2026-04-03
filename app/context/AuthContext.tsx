import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, AuthResponse, User } from "../services/api";
import { setCachedToken } from "../config/apiConfig";

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
  sendEmailVerification: () => Promise<void>;
  // OTP verification
  phoneVerified: boolean;
  setPhoneVerified: (verified: boolean) => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Restore auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [token, userDataStr] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        await AsyncStorage.removeItem("isGuest");

        if (token) {
          setCachedToken(token);
          if (userDataStr) {
            setUser(JSON.parse(userDataStr));
            setIsLoggedIn(true);
          }
          // Refresh profile in background — don't block the UI
          refreshProfile().catch(() => {});
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
      if (error instanceof Error && /token failed|no token|jwt/i.test(error.message)) {
        await AsyncStorage.multiRemove(["token", "user"]);
        setCachedToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
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

      if (!response.token) {
        throw new Error('Login response missing token');
      }

      console.log('[Auth] Login token received:', response.token.substring(0, 20) + '...');

      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        location: response.user.location,
      };

      await AsyncStorage.setItem("token", response.token);
      setCachedToken(response.token);

      // Verify token was stored correctly
      const storedToken = await AsyncStorage.getItem("token");
      console.log('[Auth] Token stored in AsyncStorage:', storedToken ? 'yes' : 'NO');

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.removeItem("isGuest");

      setUser(userData);
      setIsLoggedIn(true);
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
      setCachedToken(response.token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.removeItem("isGuest");

      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };

  // LOGOUT
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setCachedToken(null);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("isGuest");

    setUser(null);
    setIsLoggedIn(false);
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
        user,
        loading,
        login,
        signup,
        logout,
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
