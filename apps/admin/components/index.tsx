"use client";

import { ReactNode } from "react";
import { SidebarRoutes } from "@/routes";
import { useAuth } from "./context/auth-context";
import HeaderLogo from "@workspace/ui/shared/header-logo/header-logo";
import { BreadcrumbProvider } from "@workspace/ui/context/breadcrumb-context";
import { LayoutProvider } from "@workspace/ui/shared/sidebar-layout/sidebar-layout";
import { UserFooter } from "@workspace/ui/shared/sidebar-layout/user-footer/user-footer";

export function RootProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <BreadcrumbProvider>
      <LayoutProvider
        header={
          <HeaderLogo
            title={"Warranty System"}
            subtitle={"Manage your warranties"}
          />
        }
        footer={<UserFooter user={user} />}
        sidebarRoute={SidebarRoutes}
        groupLabel="Warranty Admin"
      >
        {children}
      </LayoutProvider>
    </BreadcrumbProvider>
  );
}
