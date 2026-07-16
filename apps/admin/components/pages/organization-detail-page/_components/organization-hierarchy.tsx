import { Building2 } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import type { OrganizationDetail } from "@/lib/organization/types";

interface OrganizationHierarchyProps {
  organization: OrganizationDetail;
}

export function OrganizationHierarchy({
  organization,
}: OrganizationHierarchyProps) {
  const { hierarchy } = organization;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Branches ({hierarchy.children.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hierarchy.children.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No branches under this organization
            </p>
          ) : (
            <div className="space-y-2">
              {hierarchy.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {child.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {hierarchy.parent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{hierarchy.parent.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hierarchy.root && hierarchy.root.id !== organization.id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Root Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{hierarchy.root.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
