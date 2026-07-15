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
import { FileUpload } from "@workspace/ui/shared/file-upload";
import type { UploadedFileInfo } from "@workspace/ui/shared/file-upload";

import { useOrganizations } from "@/components/context/organization-context";
import { uploadFileWithValidation } from "@/lib/file-upload";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/lib/organization/validation";
import type { Organization, OrganizationType } from "@/lib/organization/types";
import { toast } from "sonner";

interface OrganizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Organization | null;
  typeOptions?: OrganizationType[];
  parentOrgId?: string;
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
  typeOptions = ["ROOT", "BRANCH"],
  parentOrgId,
}: OrganizationFormDialogProps) {
  const { createItem, updateItem, actionLoading } = useOrganizations();
  const isEdit = !!editData;

  const defaultType: OrganizationType =
    typeOptions.length === 1 && typeOptions[0] ? typeOptions[0] : "ROOT";
  const showTypeSelector = typeOptions.length > 1;
  const isBranchOnly = typeOptions.length === 1 && typeOptions[0] === "BRANCH";
  const isRootOnly = typeOptions.length === 1 && typeOptions[0] === "ROOT";

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<OrganizationType>(defaultType);
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<UploadedFileInfo | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setCompanyName(editData.companyName);
        setSlug(editData.slug);
        setType(editData.type || "ROOT");
        setLogo(editData.logo || "");
        setLogoFile(
          editData.logo
            ? {
                key: "",
                url: editData.logo,
                publicUrl: editData.logo,
                fileName: "",
                originalName: "",
                mimeType: "image/*",
                size: 0,
              }
            : null,
        );
      } else {
        setName("");
        setCompanyName("");
        setSlug("");
        setType(defaultType);
        setLogo("");
        setLogoFile(null);
      }
      setErrors({});
    }
  }, [open, editData, defaultType]);

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

  const handleLogoUpload = async (
    file: File,
  ): Promise<UploadedFileInfo | null> => {
    try {
      const folder = isBranchOnly ? "organizations/branches" : "organizations";
      const uploaded = await uploadFileWithValidation(file, { folder });

      if (uploaded) {
        const fileInfo: UploadedFileInfo = {
          key: "",
          url: uploaded,
          publicUrl: uploaded,
          fileName: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        };
        setLogo(uploaded);
        setLogoFile(fileInfo);
        return fileInfo;
      }

      return null;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload logo",
      );
      return null;
    }
  };

  const handleLogoRemove = () => {
    setLogo("");
    setLogoFile(null);
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

  const getTitle = (): string => {
    if (isEdit) return "Edit Organization";
    if (isBranchOnly) return "Create Branch";
    if (isRootOnly) return "Create Organization";
    return "Create Organization";
  };

  const getDescription = (): string => {
    if (isEdit) return "Update the organization details below.";
    if (isBranchOnly) {
      return parentOrgId
        ? "Fill in the details to create a new branch under this organization."
        : "Fill in the details to create a new branch organization.";
    }
    if (isRootOnly) {
      return "Fill in the details to create a new root organization.";
    }
    return "Fill in the details to create a new organization.";
  };

  const getTypeLabel = (): string => {
    if (isRootOnly) return "Root Organization";
    if (isBranchOnly) return "Branch Organization";
    return "Organization Type";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder={
                isBranchOnly
                  ? "e.g., TechServe Mumbai"
                  : "e.g., TechServe India"
              }
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
              placeholder={
                isBranchOnly
                  ? "e.g., TechServe Mumbai Private Limited"
                  : "e.g., TechServe India Private Limited"
              }
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
              placeholder={
                isBranchOnly ? "e.g., techserve-mumbai" : "e.g., techserve"
              }
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

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="type">{getTypeLabel()}</Label>
              {showTypeSelector ? (
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as OrganizationType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.includes("ROOT") && (
                      <SelectItem value="ROOT">Root Organization</SelectItem>
                    )}
                    {typeOptions.includes("BRANCH") && (
                      <SelectItem value="BRANCH">
                        Branch Organization
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="type"
                    value={
                      type === "ROOT"
                        ? "Root Organization"
                        : "Branch Organization"
                    }
                    disabled
                    className="bg-muted"
                  />
                  {isBranchOnly && parentOrgId && (
                    <p className="text-xs text-muted-foreground">
                      This organization will be created as a branch.
                    </p>
                  )}
                </div>
              )}
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Logo</Label>
            <FileUpload
              onUpload={handleLogoUpload}
              onRemove={handleLogoRemove}
              value={logoFile}
              accept="image/*"
              buttonText="Upload Logo"
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
