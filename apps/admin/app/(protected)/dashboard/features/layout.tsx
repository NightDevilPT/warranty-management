import { FeaturesProvider } from "@/components/context/feature-context";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FeaturesProvider>{children}</FeaturesProvider>;
}
