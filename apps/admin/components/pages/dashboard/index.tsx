"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Building2, CheckCircle, Users, Tag, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@workspace/ui/lib/api-client";

// ──── Types ────

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

interface RecentOrganization {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardResponse {
  stats: DashboardStats;
  organizationsByType: StatItem[];
  organizationsByStatus: StatItem[];
  recentOrganizations: RecentOrganization[];
}

// ──── Custom Tooltip ────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">
        Count:{" "}
        <span className="font-semibold text-foreground">
          {payload[0].value}
        </span>
      </p>
    </div>
  );
}

// ──── Stat Card ────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

// ──── Page ────

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const result = await apiClient.get<DashboardResponse>("/admin/dashboard");
      setData(result);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and statistics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          label="Organizations"
          value={data.stats.totalOrganizations}
          icon={Building2}
        />
        <StatCard
          label="Active"
          value={data.stats.activeOrganizations}
          icon={CheckCircle}
        />
        <StatCard label="Users" value={data.stats.totalUsers} icon={Users} />
        <StatCard label="Brands" value={data.stats.totalBrands} icon={Tag} />
        <StatCard
          label="Categories"
          value={data.stats.totalCategories}
          icon={FolderTree}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organizations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.organizationsByType}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: "var(--muted)",
                      opacity: 0.3,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organizations by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.organizationsByStatus}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: "var(--muted)",
                      opacity: 0.3,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No organizations yet
                  </TableCell>
                </TableRow>
              ) : (
                data.recentOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {org.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{org.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={org.isActive ? "default" : "secondary"}>
                        {org.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
