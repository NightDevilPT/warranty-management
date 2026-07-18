"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Tag,
  ExternalLink,
  Building2,
  Check,
  X,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { DataTable } from "@workspace/ui/shared/data-table/data-table";
import {
  AutoComplete,
  type AutoCompleteOption,
} from "@workspace/ui/shared/autocomplete";
import { cn } from "@workspace/ui/lib/utils";

import { useBrands } from "@/components/context/brand-context";
import * as orgApi from "@/lib/organization";
import type { Brand } from "@/lib/brand/types";

import { PageSkeleton } from "./_components/page-skeleton";
import { PageEmpty } from "./_components/page-empty";
import { BrandFormDialog } from "./_components/brand-form-dialog";
import { DeleteDialog } from "./_components/delete-dialog";

interface BrandsPageProps {
  scopedOrgId?: string;
  hideHeader?: boolean;
}

export function BrandsPage({
  scopedOrgId,
  hideHeader = false,
}: BrandsPageProps) {
  const {
    items,
    fetchLoading,
    search,
    statusFilter,
    page,
    totalPages,
    total,
    limit,
    setSearch,
    setStatusFilter,
    setPage,
    setLimit,
    setOrgId,
    updateStatus,
  } = useBrands();

  const [createOpen, setCreateOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [selectedOrgId, setSelectedOrgId] = useState(scopedOrgId || "");

  const showOrgSelector = !scopedOrgId;

  useEffect(() => {
    if (scopedOrgId) {
      setOrgId(scopedOrgId);
      setSelectedOrgId(scopedOrgId);
    } else {
      // No scoped org → show all brands
      setOrgId("");
    }
  }, [scopedOrgId, setOrgId]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setSearch(value);
    },
    [setSearch],
  );

  const handleOrgChange = useCallback(
    (value: string, _option?: AutoCompleteOption) => {
      setSelectedOrgId(value);
      setOrgId(value || "");
    },
    [setOrgId],
  );

  const handleOrgClear = useCallback(() => {
    setSelectedOrgId("");
    setOrgId("");
  }, [setOrgId]);

  const handleSearchOrganizations = useCallback(
    async (query: string): Promise<AutoCompleteOption[]> => {
      try {
        const filters: Record<string, string | number | boolean | undefined> = {
          limit: 25,
          status: "active",
        };
        if (query) filters.search = query;

        const res = await orgApi.getOrganizations(filters);
        if (res.success && res.data) {
          return res.data.map((org) => ({
            value: org.id,
            label: org.name,
            slug: org.slug,
            logo: org.logo || null,
            type: org.type,
          }));
        }
        return [];
      } catch {
        return [];
      }
    },
    [],
  );

  const handleEdit = useCallback((brand: Brand, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditBrand(brand);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((brand: Brand, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteBrand(brand);
    setDeleteOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    (brand: Brand, action: "activate" | "deactivate", e?: React.MouseEvent) => {
      e?.stopPropagation();
      updateStatus(brand.id, action);
    },
    [updateStatus],
  );

  const columns = [
    {
      key: "logo",
      header: "",
      className: "w-[60px]",
      render: (brand: Brand) => (
        <div className="flex items-center justify-center">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-10 w-10 rounded-lg object-cover border bg-muted"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Brand",
      render: (brand: Brand) => (
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{brand.name}</p>
          <p className="text-xs text-muted-foreground">{brand.slug}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (brand: Brand) => (
        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
          {brand.description || "-"}
        </p>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (brand: Brand) =>
        brand.isActive ? (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      key: "website",
      header: "Website",
      render: (brand: Brand) =>
        brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            Visit
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (brand: Brand) =>
        new Date(brand.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      header: "Actions",
      render: (brand: Brand) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => handleEdit(brand, e)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {brand.isActive ? (
              <DropdownMenuItem
                onClick={(e) => handleStatusChange(brand, "deactivate", e)}
                className="text-yellow-600"
              >
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => handleStatusChange(brand, "activate", e)}
                className="text-green-600"
              >
                <Power className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => handleDelete(brand, e)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className={hideHeader ? "" : "space-y-6 p-6"}>
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Brands</h1>
            <p className="text-sm text-muted-foreground">
              {selectedOrgId
                ? "Manage product brands and manufacturers"
                : "Showing all brands across organizations"}
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2"
            disabled={!selectedOrgId}
          >
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </div>
      )}

      {/* Organization Selector */}
      {showOrgSelector && (
        <div className="max-w-md">
          <AutoComplete
            value={selectedOrgId}
            onChange={handleOrgChange}
            onSearch={handleSearchOrganizations}
            placeholder="Filter by organization (optional)..."
            searchPlaceholder="Type to search organizations..."
            emptyMessage="No organizations found."
            renderOption={(option, isSelected) => (
              <div className="flex items-center gap-3">
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isSelected ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.logo ? (
                  <img
                    src={option.logo}
                    alt={option.label}
                    className="h-8 w-8 rounded-md object-cover border bg-muted"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    "h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0",
                    option.logo ? "hidden" : "",
                  )}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.slug}
                  </span>
                </div>
              </div>
            )}
            renderTrigger={(option) =>
              option ? (
                <div className="flex items-center gap-2 truncate">
                  {option.logo ? (
                    <img
                      src={option.logo}
                      alt={option.label}
                      className="h-5 w-5 rounded object-cover border bg-muted"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <Building2
                    className={cn(
                      "h-4 w-4 text-primary shrink-0",
                      option.logo ? "hidden" : "",
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">All organizations</span>
              )
            }
          />
          {selectedOrgId && (
            <button
              onClick={handleOrgClear}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear filter - show all brands
            </button>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, or description..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {fetchLoading && items.length === 0 ? (
        <PageSkeleton />
      ) : items.length === 0 && !search && !statusFilter ? (
        <PageEmpty onCreateNew={() => setCreateOpen(true)} />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={fetchLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <BrandFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <BrandFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editData={editBrand}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        brand={deleteBrand}
      />
    </div>
  );
}
