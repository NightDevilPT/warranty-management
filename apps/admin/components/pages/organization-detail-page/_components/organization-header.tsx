import { Building2 } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";

import type { OrganizationDetail } from "@/lib/organization/types";

interface OrganizationHeaderProps {
  organization: OrganizationDetail;
}

export function OrganizationHeader({ organization }: OrganizationHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      {organization.logo ? (
        <img
          src={organization.logo}
          alt={organization.name}
          className="h-20 w-20 rounded-xl object-cover border bg-muted"
        />
      ) : (
        <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold truncate">{organization.name}</h1>
          <Badge variant={organization.isActive ? "default" : "destructive"}>
            {organization.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="secondary">{organization.type}</Badge>
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          {organization.companyName}
        </p>
      </div>
    </div>
  );
}
