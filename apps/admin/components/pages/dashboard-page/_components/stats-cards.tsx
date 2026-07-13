"use client";

// 1. React/Next.js dependencies
// (none)

// 2. Third-party packages
import {
  Building2,
  Users,
  Tag,
  FolderTree,
  Store,
  CheckCircle,
} from "lucide-react";

// 3. Shared Workspace Packages (@workspace/ui)
import SpotlightCard from "@workspace/ui/components/spotlight-card";
import { Label } from "@workspace/ui/components/label";

// 4. Portal-specific Modules (@/)
// (none)

// 5. Local Components (./_components)
// (none)

interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalBrands: number;
  totalCategories: number;
  totalDealerTypes: number;
}

const statCards = [
  {
    key: "totalOrganizations" as const,
    label: "Total Organizations",
    icon: Building2,
    description: "All registered orgs",
  },
  {
    key: "activeOrganizations" as const,
    label: "Active Organizations",
    icon: CheckCircle,
    description: "Currently active",
  },
  {
    key: "totalUsers" as const,
    label: "Total Users",
    icon: Users,
    description: "Across all orgs",
  },
  {
    key: "totalBrands" as const,
    label: "Total Brands",
    icon: Tag,
    description: "Registered brands",
  },
  {
    key: "totalCategories" as const,
    label: "Total Categories",
    icon: FolderTree,
    description: "Product categories",
  },
  {
    key: "totalDealerTypes" as const,
    label: "Total Dealer Types",
    icon: Store,
    description: "Dealer type entries",
  },
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <SpotlightCard key={card.key} className="p-0 border bg-transparent">
            <div>
              <div className="flex items-start justify-start mb-4 gap-5">
                <div className="inline-flex items-center justify-center rounded-xl p-2.5 bg-muted/50 ring-1 ring-border/50">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <Label className="text-3xl mt-1 font-bold leading-none tracking-tight text-foreground tabular-nums">
                  {value.toLocaleString()}
                </Label>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {card.label}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {card.description}
                </p>
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
