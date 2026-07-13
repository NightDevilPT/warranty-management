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
import { toast } from "sonner";
import * as authApi from "@/lib/auth";
import type {
  AuthUser,
  AuthOrg,
  SendOtpInput,
  VerifyOtpInput,
  UpdateProfileInput,
  ChangePasswordInput,
  SendOtpApiResponse,
  VerifyOtpApiResponse,
  ProfileApiResponse,
  ChangePasswordApiResponse,
} from "@/lib/auth/types";

interface AuthContextType {
  user: AuthUser | null;
  org: AuthOrg | null;
  permissions: string[];
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  sendOtp: (input: SendOtpInput) => Promise<SendOtpApiResponse>;
  verifyOtp: (input: VerifyOtpInput) => Promise<VerifyOtpApiResponse>;
  logout: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<ProfileApiResponse>;
  changePassword: (
    input: ChangePasswordInput,
  ) => Promise<ChangePasswordApiResponse>;
  uploadProfilePicture: (file: File) => Promise<ProfileApiResponse>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ["/auth/login"];
const DASHBOARD_ROUTE = "/dashboard";

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
      const response = await authApi.fetchProfile();

      if (!response.success) {
        setUser(null);
        setOrg(null);
        setPermissions([]);
        return false;
      }

      const data = response.data;
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
      const isAuth = await fetchProfile();
      const isPublic = PUBLIC_ROUTES.includes(pathname);
      if (!isAuth && !isPublic) router.push("/auth/login");
      if (isAuth && isPublic) router.push(DASHBOARD_ROUTE);
      setInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!user && !isPublic) router.push("/auth/login");
    if (user && isPublic) router.push(DASHBOARD_ROUTE);
  }, [pathname, user, initialized, router]);

  const sendOtp = useCallback(
    async (input: SendOtpInput): Promise<SendOtpApiResponse> => {
      setLoading(true);
      try {
        const response = await authApi.sendOtp(input);
        if (response.success) {
          toast.success(response.data.message);
          if (response.data.otp) toast.info(`Dev OTP: ${response.data.otp}`);
        } else {
          toast.error(response.message);
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const verifyOtp = useCallback(
    async (input: VerifyOtpInput): Promise<VerifyOtpApiResponse> => {
      setLoading(true);
      try {
        const response = await authApi.verifyOtp(input);
        if (response.success) {
          const data = response.data;
          setUser(data.user);
          setOrg(data.org);
          setPermissions(data.permissions);
          toast.success("Logged in successfully");
        } else {
          toast.error(response.message);
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authApi.logout();
      if (response.success) {
        setUser(null);
        setOrg(null);
        setPermissions([]);
        toast.success("Logged out");
        router.push("/auth/login");
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<ProfileApiResponse> => {
      setLoading(true);
      try {
        const response = await authApi.updateProfile(input);
        if (response.success) {
          const data = response.data;
          setUser({
            id: data.id,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            profile: data.profile ?? null,
          });
          toast.success("Profile updated");
        } else {
          toast.error(response.message);
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const changePassword = useCallback(
    async (input: ChangePasswordInput): Promise<ChangePasswordApiResponse> => {
      setLoading(true);
      try {
        const response = await authApi.changePassword(input);
        if (response.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.message);
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const uploadProfilePicture = useCallback(
    async (file: File): Promise<ProfileApiResponse> => {
      setLoading(true);
      try {
        const response = await authApi.uploadProfilePicture(file);
        if (response.success) {
          const data = response.data;
          setUser((prev) =>
            prev ? { ...prev, profile: data.profile ?? null } : null,
          );
          toast.success("Picture uploaded");
        } else {
          toast.error(response.message);
        }
        return response;
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
        isAuthenticated: !!user,
        sendOtp,
        verifyOtp,
        logout,
        updateProfile,
        changePassword,
        uploadProfilePicture,
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
