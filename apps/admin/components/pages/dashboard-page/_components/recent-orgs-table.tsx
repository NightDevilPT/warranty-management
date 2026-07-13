"use client";

// 1. React/Next.js dependencies
// (none)

// 2. Third-party packages
import { Building2 } from "lucide-react";

// 3. Shared Workspace Packages (@workspace/ui)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

// 4. Portal-specific Modules (@/)
// (none)

// 5. Local Components (./_components)
// (none)

interface RecentOrg {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export function RecentOrgsTable({
  organizations,
}: {
  organizations: RecentOrg[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Organizations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        /{org.slug}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{org.type}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={org.isActive ? "default" : "secondary"}>
                    {org.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
