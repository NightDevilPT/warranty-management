"use client";

// 1. React/Next.js dependencies
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party packages
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

// 3. Shared Workspace Packages (@workspace/ui)
import { AuthCard } from "@workspace/ui/shared/auth/auth-card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";

// 4. Portal-specific Modules (@/)
import { useAuth } from "@/components/context/auth-context";

export function LoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");

  const handleSendOtp = async () => {
    const response = await sendOtp({ email });
    if (response.success) setStep("verify");
  };

  const handleVerifyOtp = async () => {
    const response = await verifyOtp({ email, otp: Number(otp) });
    if (response.success) router.push("/dashboard");
  };

  return (
    <AuthCard
      portalType="admin"
      actions={
        step === "email"
          ? [
              {
                label: loading ? "Sending OTP..." : "Send OTP",
                onClick: handleSendOtp,
                loading,
                disabled: !email.trim() || loading,
              },
            ]
          : [
              {
                label: "Back to email",
                onClick: () => {
                  setStep("email");
                  setOtp("");
                },
                variant: "ghost",
                disabled: loading,
              },
            ]
      }
    >
      {step === "email" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@warranty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                autoFocus
                autoComplete="email"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {email}
          </button>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Verification code</Label>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={() => handleVerifyOtp()}
              disabled={loading}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
          </div>

          <Button
            variant="link"
            size="sm"
            className="w-full text-xs"
            onClick={handleSendOtp}
            disabled={loading}
          >
            Didn&apos;t receive a code? Resend
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
