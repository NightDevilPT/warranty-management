import { OrganizationsProvider } from "@/components/context/organization-context";

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrganizationsProvider>{children}</OrganizationsProvider>;
}
