"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { AuthCard } from "@workspace/ui/shared/auth/auth-card";
import { useAuth } from "@/components/context/auth-context";

export function LoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    try {
      await sendOtp(email);
      setOtp("");
      setStep("verify");
    } catch {
      // Error handled in context
    }
  };

  const handleVerifyOtp = async (value: string) => {
    if (value.length !== 6) return;
    try {
      await verifyOtp(email, Number(value));
      router.push("/dashboard");
    } catch {
      setOtp("");
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtp("");
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
                onClick: handleBack,
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
            onClick={handleBack}
            type="button"
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

            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
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
            </div>

            <Button
              onClick={() => handleVerifyOtp(otp)}
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
