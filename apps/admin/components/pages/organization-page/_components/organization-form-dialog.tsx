"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { useOrganizations } from "@/components/context/organization-context";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/lib/organization/validation";
import type { Organization } from "@/lib/organization/types";
import { toast } from "sonner";

interface OrganizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Organization | null;
}

interface FormErrors {
  name?: string;
  companyName?: string;
  slug?: string;
  type?: string;
  logo?: string;
}

export function OrganizationFormDialog({
  open,
  onOpenChange,
  editData,
}: OrganizationFormDialogProps) {
  const { createItem, updateItem, actionLoading } = useOrganizations();
  const isEdit = !!editData;

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"ROOT" | "BRANCH">("ROOT");
  const [logo, setLogo] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setCompanyName(editData.companyName);
        setSlug(editData.slug);
        setType(editData.type);
        setLogo(editData.logo || "");
      } else {
        setName("");
        setCompanyName("");
        setSlug("");
        setType("ROOT");
        setLogo("");
      }
      setErrors({});
    }
  }, [open, editData]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  };

  const validate = (): boolean => {
    const data = { name, companyName, slug, type, logo: logo || undefined };
    const schema = isEdit ? updateOrganizationSchema : createOrganizationSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field as keyof FormErrors]) {
          fieldErrors[field as keyof FormErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    let success: boolean;

    if (isEdit && editData) {
      success = await updateItem(editData.id, {
        name,
        companyName,
        slug,
        logo: logo || undefined,
      });
    } else {
      success = await createItem({
        name,
        companyName,
        slug,
        type,
        logo: logo || undefined,
      });
    }

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Organization" : "Create Organization"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the organization details below."
              : "Fill in the details to create a new organization."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="e.g., TechServe India"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Legal Company Name</Label>
            <Input
              id="companyName"
              placeholder="e.g., TechServe India Private Limited"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="e.g., techserve"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={isEdit}
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier. Only lowercase letters, numbers, and
              hyphens.
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Organization Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "ROOT" | "BRANCH")}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROOT">Root</SelectItem>
                <SelectItem value="BRANCH">Branch</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL (Optional)</Label>
            <Input
              id="logo"
              placeholder="https://example.com/logo.png"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
