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
import { toast } from "sonner";

import * as api from "@/lib/organization";
import { inviteSuperAdminSchema } from "@/lib/organization/validation";
import type { InviteSuperAdminFormData } from "@/lib/organization/validation";
import type { Organization } from "@/lib/organization/types";

interface InviteSuperAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export function InviteSuperAdminDialog({
  open,
  onOpenChange,
  organization,
}: InviteSuperAdminDialogProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const data = {
      email,
      firstName,
      lastName,
      phoneNumber: phoneNumber || undefined,
    };

    const result = inviteSuperAdminSchema.safeParse(data);

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

    if (!organization) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.inviteSuperAdmin(organization.id, {
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
      });

      if (res.success) {
        toast.success(
          res.data?.invitationSent
            ? `Invitation sent to ${email}`
            : `Super admin ${email} added successfully`,
        );
        onOpenChange(false);
      } else {
        toast.error(res.message || "Failed to invite super admin");
      }
    } catch {
      toast.error("Failed to invite super admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Super Admin</DialogTitle>
          <DialogDescription>
            Invite a user to manage{" "}
            <span className="font-medium text-foreground">
              {organization?.name}
            </span>{" "}
            as a Company Super Admin. They will receive an email with login
            instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Raj"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              placeholder="+919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
