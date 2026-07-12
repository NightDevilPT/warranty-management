import {
  LayoutDashboard,
  Building2,
  Shield,
  Tag,
  FolderTree,
  Users,
  UserCog,
  Settings,
} from "lucide-react";
import { ISidebarRoutes } from "@workspace/ui/shared/sidebar-layout/sidebar-layout";

export const SidebarRoutes: ISidebarRoutes[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: Building2,
    child: [
      {
        id: "onboard-org",
        label: "Onboard Organization",
        icon: Building2,
        href: "/admin/organizations/onboard",
      },
      {
        id: "manage-orgs",
        label: "Manage Organizations",
        icon: Building2,
        href: "/admin/organizations",
      },
    ],
  },
  {
    id: "features",
    label: "Features & Permissions",
    icon: Shield,
    child: [
      {
        id: "create-feature",
        label: "Create Feature",
        icon: Shield,
        href: "/admin/features/create",
      },
      {
        id: "manage-features",
        label: "Manage Features",
        icon: Shield,
        href: "/admin/features",
      },
      {
        id: "feature-tree",
        label: "Permission Tree",
        icon: Shield,
        href: "/admin/features/tree",
      },
    ],
  },
  {
    id: "brands",
    label: "Brands",
    icon: Tag,
    href: "/admin/brands",
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderTree,
    href: "/admin/categories",
  },
  {
    id: "dealer-types",
    label: "Role Templates",
    icon: Users,
    child: [
      {
        id: "create-dealer-type",
        label: "Create Role Template",
        icon: Users,
        href: "/admin/dealer-types/create",
      },
      {
        id: "manage-dealer-types",
        label: "Manage Role Templates",
        icon: Users,
        href: "/admin/dealer-types",
      },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: UserCog,
    child: [
      {
        id: "invite-user",
        label: "Invite User",
        icon: UserCog,
        href: "/admin/users/invite",
      },
      {
        id: "manage-users",
        label: "Manage Users",
        icon: UserCog,
        href: "/admin/users",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];
