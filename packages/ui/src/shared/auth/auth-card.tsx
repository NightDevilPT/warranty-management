"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Shield, Building2, User, Store, Loader2 } from "lucide-react";
import React from "react";

interface AuthAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  loading?: boolean;
  disabled?: boolean;
}

interface AuthCardProps {
  portalType: "admin" | "company" | "consumer";
  title?: string;
  description?: string;
  orgName?: string;
  orgLogo?: string;
  children: React.ReactNode;
  actions?: AuthAction[];
}

const portalConfig = {
  admin: { icon: Shield, label: "System" },
  company: { icon: Building2, label: "Business" },
  consumer: { icon: User, label: "Customer" },
};

export function AuthCard({
  portalType,
  title,
  description,
  orgName,
  orgLogo,
  children,
  actions,
}: AuthCardProps) {
  const { icon: Icon, label } = portalConfig[portalType];
  const displayTitle = title || `${label} Portal`;
  const displayDescription =
    description || `Sign in to your ${label.toLowerCase()} account`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="gap-2 px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Badge>
          </div>

          {portalType !== "admin" && orgName && (
            <div className="flex items-center justify-center gap-3">
              {orgLogo ? (
                <img
                  src={orgLogo}
                  alt={orgName}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="text-left">
                <CardTitle className="text-sm">{orgName}</CardTitle>
                <CardDescription className="text-xs">
                  {portalType === "company" ? "Organization" : "Customer"}{" "}
                  Account
                </CardDescription>
              </div>
            </div>
          )}

          <div>
            <CardTitle className="text-xl">{displayTitle}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {displayDescription}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>{children}</CardContent>

        {actions && actions.length > 0 && (
          <CardFooter className="flex-col gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                className="w-full"
                disabled={action.disabled || action.loading}
                onClick={action.onClick}
              >
                {action.loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {action.label}
              </Button>
            ))}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
