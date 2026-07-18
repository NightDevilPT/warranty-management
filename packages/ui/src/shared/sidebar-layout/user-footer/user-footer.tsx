"use client";

import { useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

interface UserFooterProps {
  user: {
    fullName?: string | null;
    email?: string | null;
    profile?: string | null;
  } | null;
}

export function UserFooter({ user }: UserFooterProps) {
  const [avatarError, setAvatarError] = useState(false);

  const initials = useMemo(() => {
    if (!user?.fullName) return "?";

    const nameParts = user.fullName.trim().split(/\s+/);
    if (nameParts.length === 0) return "?";

    const firstInitial = nameParts[0]?.charAt(0)?.toUpperCase() || "";
    const lastInitial =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1]?.charAt(0)?.toUpperCase()
        : "";

    return `${firstInitial}${lastInitial}` || firstInitial || "?";
  }, [user?.fullName]);

  return (
    <div className="flex items-center gap-3 cursor-pointer">
      {/* Avatar Section */}
      <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
        {user?.profile && !avatarError ? (
          <AvatarImage
            src={user.profile}
            alt={user.fullName || "User"}
            onError={() => setAvatarError(true)}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback
          className={cn(
            "text-sm font-semibold text-primary-foreground bg-primary",
          )}
          delayMs={0}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* User Info Section */}
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate capitalize">
          {user?.fullName || "Unknown User"}
        </p>
        {user?.email && (
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        )}
      </div>
    </div>
  );
}
