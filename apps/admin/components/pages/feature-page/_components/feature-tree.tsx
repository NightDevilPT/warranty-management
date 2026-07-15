"use client";

import { Shield } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

import type {
  FeatureTreeItem,
  FeatureChild,
  FeatureStatus,
} from "@/lib/feature/types";

interface FeatureTreeProps {
  tree: FeatureTreeItem[];
  loading: boolean;
  onStatusChange: (id: string, status: FeatureStatus) => void;
}

// Fixed widths for right-side alignment
const RIGHT_CONTROLS_WIDTH = "w-[190px]";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ENABLED":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3 w-3" />
          Enabled
        </Badge>
      );
    case "DISABLED":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-rose-200 bg-rose-50 font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
        >
          <XCircle className="h-3 w-3" />
          Disabled
        </Badge>
      );
    case "COMING_SOON":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
        >
          <Clock className="h-3 w-3" />
          Coming soon
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-medium">
          {status}
        </Badge>
      );
  }
}

function StatusDot({ className }: { className: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} />;
}

function RightControls({
  id,
  status,
  sortOrder,
  onStatusChange,
}: {
  id: string;
  status: string;
  sortOrder: number;
  onStatusChange: (id: string, status: FeatureStatus) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 shrink-0 ${RIGHT_CONTROLS_WIDTH} justify-end`}
    >
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
        #{sortOrder}
      </span>
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(id, value as FeatureStatus)}
      >
        <SelectTrigger className="h-7 w-[120px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="ENABLED">
            <div className="flex items-center gap-2">
              <StatusDot className="bg-emerald-500" />
              Enable
            </div>
          </SelectItem>
          <SelectItem value="DISABLED">
            <div className="flex items-center gap-2">
              <StatusDot className="bg-rose-500" />
              Disable
            </div>
          </SelectItem>
          <SelectItem value="COMING_SOON">
            <div className="flex items-center gap-2">
              <StatusDot className="bg-amber-500" />
              Coming soon
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function RightControlsSkeleton() {
  return (
    <div
      className={`flex items-center gap-3 shrink-0 ${RIGHT_CONTROLS_WIDTH} justify-end`}
    >
      <Skeleton className="h-3 w-8" />
      <Skeleton className="h-7 w-[120px] rounded" />
    </div>
  );
}

function ChildRow({
  child,
  depth = 1,
  onStatusChange,
}: {
  child: FeatureChild;
  depth?: number;
  onStatusChange: (id: string, status: FeatureStatus) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
      style={{
        paddingLeft: `${depth * 28 + 12}px`,
      }}
    >
      <div className="w-6 shrink-0" />

      <Shield className="h-4 w-4 shrink-0 text-muted-foreground/70" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium leading-none">
            {child.name}
          </p>
          <StatusBadge status={child.status} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {child.code}
          </code>
          {child.description && (
            <p className="truncate text-xs text-muted-foreground">
              {child.description}
            </p>
          )}
        </div>
      </div>

      <RightControls
        id={child.id}
        status={child.status}
        sortOrder={child.sortOrder}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

function TreeNode({
  node,
  onStatusChange,
}: {
  node: FeatureTreeItem;
  onStatusChange: (id: string, status: FeatureStatus) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <AccordionItem value={node.id} className="border-b-0">
      <div className="flex items-center rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50">
        <div className="flex-1 min-w-0">
          <AccordionTrigger
            className={`flex flex-1 items-center gap-3 py-0 hover:no-underline min-w-0 ${!hasChildren ? "pointer-events-none [&>svg]:hidden" : ""}`}
          >
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground/70" />

            <div className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium leading-none">
                  {node.name}
                </p>
                <StatusBadge status={node.status} />
                {hasChildren && (
                  <span className="text-xs text-muted-foreground">
                    {node.children.length}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {node.code}
                </code>
                {node.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {node.description}
                  </p>
                )}
              </div>
            </div>
          </AccordionTrigger>
        </div>

        <RightControls
          id={node.id}
          status={node.status}
          sortOrder={node.sortOrder}
          onStatusChange={onStatusChange}
        />
      </div>

      {hasChildren && (
        <AccordionContent>
          <div className="space-y-0.5 pt-0.5">
            {node.children.map((child) => (
              <ChildRow
                key={child.id}
                child={child}
                depth={1}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </AccordionContent>
      )}
    </AccordionItem>
  );
}

function ChildRowSkeleton({ depth = 1 }: { depth?: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-md px-3 py-2.5"
      style={{
        paddingLeft: `${depth * 28 + 12}px`,
      }}
    >
      <div className="w-6 shrink-0" />
      <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <RightControlsSkeleton />
    </div>
  );
}

function TreeNodeSkeleton({ hasChildren = false }: { hasChildren?: boolean }) {
  return (
    <div className="flex items-center rounded-md px-3 py-2.5">
      <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-5 w-20 rounded-full" />
              {hasChildren && <Skeleton className="h-3 w-4" />}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
        {hasChildren && <Skeleton className="h-4 w-4 shrink-0" />}
      </div>
      <RightControlsSkeleton />
    </div>
  );
}

export function FeatureTreeSkeleton() {
  return (
    <div className="space-y-0.5">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <TreeNodeSkeleton hasChildren={i < 3} />
          {i < 3 && (
            <div className="space-y-0.5">
              {[...Array(i === 0 ? 1 : i === 1 ? 4 : 3)].map((_, j) => (
                <ChildRowSkeleton key={j} depth={1} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FeatureTree({
  tree,
  loading,
  onStatusChange,
}: FeatureTreeProps) {
  if (loading) {
    return <FeatureTreeSkeleton />;
  }

  if (!tree || tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Shield className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mb-1.5 text-sm font-semibold">No features found</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Features are seeded into the database. Run the seed command to
          populate features.
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={tree.map((item) => item.id)}
      className="space-y-0.5"
    >
      {tree.map((item) => (
        <TreeNode key={item.id} node={item} onStatusChange={onStatusChange} />
      ))}
    </Accordion>
  );
}
