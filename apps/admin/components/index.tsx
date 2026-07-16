"use client";

import { ReactNode } from "react";
import { SidebarRoutes } from "@/routes";
import HeaderLogo from "@workspace/ui/shared/header-logo/header-logo";
import { BreadcrumbProvider } from "@workspace/ui/context/breadcrumb-context";
import { LayoutProvider } from "@workspace/ui/shared/sidebar-layout/sidebar-layout";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <BreadcrumbProvider>
      <LayoutProvider
        header={
          <HeaderLogo
            title={"Warranty System"}
            subtitle={"Manage your warranties"}
          />
        }
        footer={<div>Footer</div>}
        sidebarRoute={SidebarRoutes}
        groupLabel="Warranty Admin"
      >
        {children}
      </LayoutProvider>
    </BreadcrumbProvider>
  );
}
