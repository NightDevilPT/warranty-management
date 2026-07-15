"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Building2,
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

import { useOrganizations } from "@/components/context/organization-context";
import type { Organization } from "@/lib/organization/types";

import { PageSkeleton } from "./_components/page-skeleton";
import { PageEmpty } from "./_components/page-empty";
import { OrganizationFormDialog } from "./_components/organization-form-dialog";
import { DeleteDialog } from "./_components/delete-dialog";

export function OrganizationsPage() {
  const {
    items,
    fetchLoading,
    search,
    typeFilter,
    statusFilter,
    page,
    totalPages,
    total,
    limit,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    setPage,
    setLimit,
    updateStatus,
  } = useOrganizations();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setSearch(value);
    },
    [setSearch],
  );

  const columns = [
    {
      key: "logo",
      header: "",
      className: "w-[60px]",
      render: (org: Organization) => (
        <div className="flex items-center justify-center">
          {org.logo ? (
            <img
              src={org.logo}
              alt={org.name}
              className="h-10 w-10 rounded-lg object-cover border bg-muted"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Organization",
      render: (org: Organization) => (
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{org.name}</p>
          <p className="text-xs text-muted-foreground">{org.slug}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (org: Organization) =>
        org.type === "ROOT" ? (
          <Badge variant="outline">Root</Badge>
        ) : (
          <Badge variant="outline">Branch</Badge>
        ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (org: Organization) =>
        org.isActive ? (
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
      key: "hash",
      header: "Hash",
      render: (org: Organization) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{org.hash}</code>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (org: Organization) =>
        new Date(org.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      header: "Actions",
      render: (org: Organization) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setEditOrg(org);
                setEditOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {org.isActive ? (
              <DropdownMenuItem
                onClick={() =>
                  updateStatus(org.id, {
                    action: "deactivate",
                  })
                }
                className="text-yellow-600"
              >
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => updateStatus(org.id, { action: "activate" })}
                className="text-green-600"
              >
                <Power className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setDeleteOrg(org);
                setDeleteOpen(true);
              }}
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            Manage all organizations, their status, and super admin assignments
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, or company name..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ROOT">Root</SelectItem>
            <SelectItem value="BRANCH">Branch</SelectItem>
          </SelectContent>
        </Select>

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

      {fetchLoading && items.length === 0 ? (
        <PageSkeleton />
      ) : items.length === 0 && !search && !typeFilter && !statusFilter ? (
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

      <OrganizationFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <OrganizationFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editData={editOrg}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        organization={deleteOrg}
      />
    </div>
  );
}
