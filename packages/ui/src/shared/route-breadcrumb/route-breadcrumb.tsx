"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { useBreadcrumb } from "@workspace/ui/context/breadcrumb-context";

interface RouteBreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  organizations: "Organizations",
  features: "Features",
  brands: "Brands",
  categories: "Categories",
  users: "Users",
  "dealer-types": "Dealer Types",
  settings: "Settings",
  profile: "Profile",
};

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    str,
  );
}

export const RouteBreadcrumb: React.FC = () => {
  const pathname = usePathname();
  const { pathMap } = useBreadcrumb();
  const pathSegments = pathname.split("/").filter((segment: string) => segment);

  const breadcrumbItems: RouteBreadcrumbItem[] = pathSegments.map(
    (segment: string, index: number) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const isCurrent = index === pathSegments.length - 1;

      // Check breadcrumb path map first (set by pages when data loads)
      if (pathMap[href]) {
        return { label: pathMap[href], href, isCurrent };
      }

      // Check segment overrides
      if (SEGMENT_LABELS[segment]) {
        return { label: SEGMENT_LABELS[segment], href, isCurrent };
      }

      // If UUID, show parent segment label
      if (isUUID(segment)) {
        const parentSegment = pathSegments[index - 1];
        const parentLabel = parentSegment
          ? SEGMENT_LABELS[parentSegment] || formatSegment(parentSegment)
          : "Details";
        return { label: parentLabel, href, isCurrent };
      }

      return { label: formatSegment(segment), href, isCurrent };
    },
  );

  const maxItems = 4;
  const shouldCollapse = breadcrumbItems.length > maxItems;

  const displayedItems = shouldCollapse
    ? [
        breadcrumbItems[0],
        breadcrumbItems[1],
        ...(breadcrumbItems.length > 2
          ? [breadcrumbItems[breadcrumbItems.length - 1]]
          : []),
      ].filter((item): item is RouteBreadcrumbItem => item !== undefined)
    : breadcrumbItems;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayedItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage className="bg-primary font-bold text-primary-foreground px-4 py-1 rounded-md">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="hover:bg-muted px-4 py-1 rounded-md"
                  asChild
                >
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < displayedItems.length - 1 && (
              <>
                {shouldCollapse && index === 1 && displayedItems.length > 2 && (
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                )}
                <BreadcrumbSeparator />
              </>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
