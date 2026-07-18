import type { Metadata } from "next";

import { BrandsProvider } from "@/components/context/brand-context";
import { OrganizationsProvider } from "@/components/context/organization-context";

export const metadata: Metadata = {
  title: "Brands",
  description:
    "Manage product brands and manufacturers across all organizations",
};

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationsProvider>
      <BrandsProvider>{children}</BrandsProvider>
    </OrganizationsProvider>
  );
}
