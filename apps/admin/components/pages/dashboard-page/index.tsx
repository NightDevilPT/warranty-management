"use client";

// 1. React/Next.js dependencies
import { useState, useEffect, useCallback } from "react";

// 2. Third-party packages
import { toast } from "sonner";

// 3. Shared Workspace Packages (@workspace/ui)
import { apiClient } from "@workspace/ui/lib/api-client";
import { PageSkeleton } from "./_components/page-skeleton";
import { OrgTypeChart } from "./_components/org-type-chart";
import { OrgStatusChart } from "./_components/org-status-chart";
import { RecentOrgsTable } from "./_components/recent-orgs-table";
import { StatsCards } from "./_components/stats-cards";

interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalBrands: number;
  totalCategories: number;
  totalDealerTypes: number;
}

interface StatItem {
  label: string;
  count: number;
}

interface RecentOrg {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  organizationsByType: StatItem[];
  organizationsByStatus: StatItem[];
  recentOrganizations: RecentOrg[];
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setFetchLoading(true);
    try {
      const res = await apiClient.get<DashboardData>("/admin/dashboard");
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || "Failed to load dashboard data");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (fetchLoading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your warranty management system
        </p>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <OrgTypeChart data={data.organizationsByType} />
        <OrgStatusChart data={data.organizationsByStatus} />
      </div>

      <RecentOrgsTable organizations={data.recentOrganizations} />
    </div>
  );
}
