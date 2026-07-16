"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";

import * as api from "@/lib/organization";
import type { OrganizationDetail } from "@/lib/organization/types";

import { PageSkeleton } from "./_components/page-skeleton";
import { OrganizationInfo } from "./_components/organization-info";
import { OrganizationStats } from "./_components/organization-stats";
import { OrganizationHeader } from "./_components/organization-header";
import { OrganizationHierarchy } from "./_components/organization-hierarchy";

interface OrganizationDetailPageProps {
  organizationId: string;
}

export function OrganizationDetailPage({
  organizationId,
}: OrganizationDetailPageProps) {
  const router = useRouter();
  const [organization, setOrganization] = useState<OrganizationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      setLoading(true);
      try {
        const res = await api.getOrganization(organizationId);
        if (res.success && res.data) {
          setOrganization(res.data);
        } else {
          toast.error(res.message || "Failed to load organization details");
        }
      } catch {
        toast.error("Failed to load organization details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  if (loading || !organization) {
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
      </div>

      <OrganizationHeader organization={organization} />
      <OrganizationInfo organization={organization} />
      <OrganizationStats organization={organization} />
      <OrganizationHierarchy organization={organization} />
    </div>
  );
}
