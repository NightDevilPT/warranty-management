"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";

import { useOrganizations } from "@/components/context/organization-context";

import { PageSkeleton } from "./_components/page-skeleton";
import { OrganizationHeader } from "./_components/organization-header";
import { OrganizationInfo } from "./_components/organization-info";
import { OrganizationStats } from "./_components/organization-stats";

interface OrganizationDetailPageProps {
  organizationId: string;
}

export function OrganizationDetailPage({
  organizationId,
}: OrganizationDetailPageProps) {
  const router = useRouter();
  const {
    selectedOrganization,
    detailLoading,
    fetchDetailById,
    clearSelectedOrganization,
  } = useOrganizations();
  const { setPathName, removePathName } = useBreadcrumb();

  useEffect(() => {
    fetchDetailById(organizationId);

    return () => {
      clearSelectedOrganization();
      removePathName(`/dashboard/organizations/${organizationId}`);
    };
  }, [
    organizationId,
    fetchDetailById,
    clearSelectedOrganization,
    removePathName,
  ]);

  useEffect(() => {
    if (selectedOrganization) {
      setPathName(
        `/dashboard/organizations/${organizationId}`,
        selectedOrganization.name,
      );
    }
  }, [selectedOrganization, organizationId, setPathName]);

  if (detailLoading || !selectedOrganization) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <OrganizationHeader organization={selectedOrganization} />
      <OrganizationStats organization={selectedOrganization} />
    </div>
  );
}
