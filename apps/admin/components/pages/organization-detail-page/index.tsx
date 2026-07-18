"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { PageSkeleton } from "./_components/page-skeleton";
import { BrandsPage } from "@/components/pages/brands-page";
import { OrganizationInfo } from "./_components/organization-info";
import { OrganizationStats } from "./_components/organization-stats";
import { OrganizationHeader } from "./_components/organization-header";

import { BrandsProvider } from "@/components/context/brand-context";
import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";
import { useOrganizations } from "@/components/context/organization-context";

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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/organizations")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <OrganizationHeader organization={selectedOrganization} />
      </div>
      <OrganizationStats organization={selectedOrganization} />
      <Tabs defaultValue="brands">
        <TabsList>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="brands" className="mt-6">
          <BrandsProvider>
            <BrandsPage scopedOrgId={organizationId} hideHeader />
          </BrandsProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
