import { Globe, Hash, Calendar, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import type { OrganizationDetail } from "@/lib/organization/types";

interface OrganizationInfoProps {
  organization: OrganizationDetail;
}

export function OrganizationInfo({ organization }: OrganizationInfoProps) {
  const info = [
    {
      label: "Slug",
      value: organization.slug,
      icon: Globe,
    },
    {
      label: "Hash",
      value: organization.hash,
      icon: Hash,
    },
    {
      label: "Created",
      value: new Date(organization.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: Calendar,
    },
    {
      label: "Last Updated",
      value: new Date(organization.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: Clock,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Organization Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {info.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-1.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
