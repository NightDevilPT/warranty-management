"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageSkeleton } from "./_components/page-skeleton";
import type { OrganizationDetail } from "@/lib/organization/types";
import { OrganizationInfo } from "./_components/organization-info";
import { OrganizationStats } from "./_components/organization-stats";
import { OrganizationHeader } from "./_components/organization-header";
import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";
import { useOrganizations } from "@/components/context/organization-context";

interface OrganizationDetailPageProps {
  organizationId: string;
}

export function OrganizationDetailPage({
  organizationId,
}: OrganizationDetailPageProps) {
  const router = useRouter();
  const { getDetailById } = useOrganizations();
  const { setPathName, removePathName } = useBreadcrumb();
  const [organization, setOrganization] = useState<OrganizationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      setLoading(true);
      const data = await getDetailById(organizationId);
      if (data) {
        setOrganization(data);
        // Set breadcrumb name when data loads
        setPathName(`/dashboard/organizations/${organizationId}`, data.name);
      }
      setLoading(false);
    };

    fetchOrganization();

    return () => {
      removePathName(`/dashboard/organizations/${organizationId}`);
    };
  }, [organizationId, getDetailById, setPathName, removePathName]);

  if (loading || !organization) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <OrganizationHeader organization={organization} />
      <OrganizationInfo organization={organization} />
      <OrganizationStats organization={organization} />
    </div>
  );
}
