import { Users, Tag, FolderTree, Shield } from "lucide-react";

import { Card, CardContent } from "@workspace/ui/components/card";

import type { OrganizationDetail } from "@/lib/organization/types";

interface OrganizationStatsProps {
  organization: OrganizationDetail;
}

export function OrganizationStats({ organization }: OrganizationStatsProps) {
  const stats = [
    {
      label: "Total Users",
      value: organization.stats.totalUsers,
      icon: Users,
    },
    {
      label: "Total Brands",
      value: organization.stats.totalBrands,
      icon: Tag,
    },
    {
      label: "Total Categories",
      value: organization.stats.totalCategories,
      icon: FolderTree,
    },
    {
      label: "Dealer Types",
      value: organization.stats.totalDealerTypes,
      icon: Shield,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
