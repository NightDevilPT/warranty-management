import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Details",
  description:
    "View organization details including hierarchy, statistics, branches, and configuration information.",
};

export default function OrganizationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
