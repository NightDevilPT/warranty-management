import type { Metadata } from "next";

import { OrganizationsProvider } from "@/components/context/organization-context";

export const metadata: Metadata = {
  title: "Organizations",
  description:
    "Manage all organizations, their status, branches, and super admin assignments. Create and configure organizations for the platform.",
};

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrganizationsProvider>{children}</OrganizationsProvider>;
}
