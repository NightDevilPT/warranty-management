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
import { Textarea } from "@workspace/ui/components/textarea";
import { FileUpload } from "@workspace/ui/shared/file-upload";
import type { UploadedFileInfo } from "@workspace/ui/shared/file-upload";

import { useBrands } from "@/components/context/brand-context";
import { uploadFileWithValidation } from "@/lib/file-upload";
import { createBrandSchema, updateBrandSchema } from "@/lib/brand/validation";
import type { Brand } from "@/lib/brand/types";
import { toast } from "sonner";

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Brand | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
}

export function BrandFormDialog({
  open,
  onOpenChange,
  editData,
}: BrandFormDialogProps) {
  const { createItem, updateItem, actionLoading } = useBrands();
  const isEdit = !!editData;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<UploadedFileInfo | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setDescription(editData.description || "");
        setWebsite(editData.website || "");
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
        setDescription("");
        setWebsite("");
        setLogo("");
        setLogoFile(null);
      }
      setErrors({});
    }
  }, [open, editData]);

  const handleLogoUpload = async (
    file: File,
  ): Promise<UploadedFileInfo | null> => {
    try {
      const uploaded = await uploadFileWithValidation(file, {
        folder: "brands",
      });

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
    const data = {
      name,
      description: description || undefined,
      logo: logo || undefined,
      website: website || undefined,
    };
    const schema = isEdit ? updateBrandSchema : createBrandSchema;
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
        description: description || undefined,
        logo: logo || undefined,
        website: website || undefined,
      });
    } else {
      success = await createItem({
        name,
        description: description || undefined,
        logo: logo || undefined,
        website: website || undefined,
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
          <DialogTitle>{isEdit ? "Edit Brand" : "Add Brand"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the brand details below."
              : "Fill in the details to create a new brand."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              placeholder="e.g., Samsung"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the brand (optional)"
              rows={3}
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://samsung.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website}</p>
            )}
          </div>

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
