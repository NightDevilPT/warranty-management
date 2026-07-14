"use client";

import type { ReactNode, ComponentType } from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  emptyMessage?: string;
  emptyIcon?: ComponentType<{ className?: string }>;
  onRowClick?: (item: T) => void;
  getRowId?: (item: T) => string;
}

function safeCellValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  // Objects/arrays: never silently render "[object Object]"
  return "—";
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 30, 50],
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  onRowClick,
  getRowId,
}: DataTableProps<T>) {
  // Defensive clamping — API/parent state can hand us bad values
  const safeTotalPages = Math.max(1, Math.floor(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), safeTotalPages);
  const safeData = data ?? [];
  const safeColumns = columns ?? [];

  // Ensure current limit is always a selectable option, even if it's a
  // custom value not in the default list (e.g. deep-linked ?limit=25)
  const availableLimits = limitOptions.includes(limit)
    ? limitOptions
    : [...limitOptions, limit].sort((a, b) => a - b);

  const isEmpty = !loading && safeData.length === 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(safeTotalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < safeTotalPages - 2) pages.push("...");
      if (safeTotalPages > 1) pages.push(safeTotalPages);
    }

    return pages;
  };

  const handlePageChange = (nextPage: number) => {
    if (loading) return;
    const clamped = Math.min(Math.max(1, nextPage), safeTotalPages);
    if (clamped === safePage) return;
    onPageChange(clamped);
  };

  if (isEmpty) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
        {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground" />}
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const skeletonRowCount = Math.min(Math.max(limit, 1), 10);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: skeletonRowCount }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {columns.map((col) => (
                        <TableCell key={col.key} className={col.className}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data.map((item) => {
                    const rowId = getRowId ? getRowId(item) : item.id;
                    return (
                      <TableRow
                        key={rowId}
                        onClick={
                          onRowClick ? () => onRowClick(item) : undefined
                        }
                        className={
                          onRowClick
                            ? "cursor-pointer hover:bg-muted/50"
                            : undefined
                        }
                      >
                        {columns.map((col) => (
                          <TableCell key={col.key} className={col.className}>
                            {col.render
                              ? col.render(item)
                              : safeCellValue(item[col.key as keyof T])}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange?.(Number(v))}
            disabled={!onLimitChange || loading}
          >
            <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLimits.map((v) => (
                <SelectItem key={v} value={String(v)}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={loading || safePage <= 1}
            onClick={() => handlePageChange(1)}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={loading || safePage <= 1}
            onClick={() => handlePageChange(safePage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={safePage === p ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                disabled={loading}
                onClick={() => handlePageChange(p as number)}
                aria-label={`Page ${p}`}
                aria-current={safePage === p ? "page" : undefined}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={loading || safePage >= safeTotalPages}
            onClick={() => handlePageChange(safePage + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={loading || safePage >= safeTotalPages}
            onClick={() => handlePageChange(safeTotalPages)}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground" aria-live="polite">
          Total: {total}
        </span>
      </div>
    </div>
  );
}
