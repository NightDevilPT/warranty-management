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
    href: "/dashboard",
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: Building2,
    href: "/dashboard/organizations",
  },
  {
    id: "feature",
    label: "Features",
    icon: FolderTree,
    href: "/dashboard/features",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];
