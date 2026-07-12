"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@workspace/ui/lib/api-client";
import { toast } from "sonner";
import type {
  SendOtpResponse,
  VerifyOtpResponse,
  ProfileResponse,
  AuthUser,
  AuthOrg,
} from "@workspace/ui/types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  org: AuthOrg | null;
  permissions: string[];
  loading: boolean;
  initialized: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: number) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ["/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrg | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiClient.get<ProfileResponse>("/auth/me");
      setUser({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        profile: data.profile ?? null,
      });
      setOrg({
        id: data.currentOrg.orgId,
        name: data.currentOrg.orgName,
        hash: "",
      });
      setPermissions(data.currentOrg.permissions);
      return true;
    } catch {
      setUser(null);
      setOrg(null);
      setPermissions([]);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await fetchProfile();
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname))
        router.push("/auth/login");
      if (isAuthenticated && PUBLIC_ROUTES.includes(pathname))
        router.push("/dashboard");
      setInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user && !PUBLIC_ROUTES.includes(pathname)) router.push("/auth/login");
    if (user && PUBLIC_ROUTES.includes(pathname)) router.push("/dashboard");
  }, [pathname, user, initialized, router]);

  const sendOtp = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const data = await apiClient.post<SendOtpResponse>(
        "/auth/admin/send-otp",
        { email },
      );
      toast.success(data.message);
      if (data.otp) toast.info(`Dev OTP: ${data.otp}`);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: number) => {
    setLoading(true);
    try {
      const data = await apiClient.post<VerifyOtpResponse>(
        "/auth/admin/verify-otp",
        { email, otp },
      );
      setUser(data.user);
      setOrg(data.org);
      setPermissions(data.permissions);
      toast.success("Logged in successfully");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
      setOrg(null);
      setPermissions([]);
      toast.success("Logged out");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const updateProfile = useCallback(
    async (body: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    }) => {
      setLoading(true);
      try {
        const data = await apiClient.patch<ProfileResponse>("/auth/me", body);
        setUser({
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          profile: data.profile ?? null,
        });
        toast.success("Profile updated");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const changePassword = useCallback(
    async (body: { currentPassword: string; newPassword: string }) => {
      setLoading(true);
      try {
        await apiClient.patch("/auth/me/password", body);
        toast.success("Password changed");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        org,
        permissions,
        loading,
        initialized,
        sendOtp,
        verifyOtp,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
