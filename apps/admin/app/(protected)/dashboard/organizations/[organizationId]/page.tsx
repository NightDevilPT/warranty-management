import { OrganizationDetailPage } from "@/components/pages/organization-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  return <OrganizationDetailPage organizationId={organizationId} />;
}
