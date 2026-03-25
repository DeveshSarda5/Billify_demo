import {
  ArrowLeftRight,
  BarChart3,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  kicker: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Executive summary",
    kicker: "Overview",
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    description: "Bills and payments",
    kicker: "Finance",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    description: "Inventory catalog",
    kicker: "Catalog",
  },
  {
    label: "Offers",
    href: "/offers",
    icon: Gift,
    description: "Discount engine",
    kicker: "Promotions",
  },
  {
    label: "Sales",
    href: "/sales",
    icon: BarChart3,
    description: "Revenue reports",
    kicker: "Insights",
  },
  {
    label: "Support",
    href: "/support",
    icon: LifeBuoy,
    description: "Tickets and SLA",
    kicker: "Operations",
  },
  {
    label: "Profile",
    href: "/admin",
    icon: User,
    description: "Account settings",
    kicker: "Admin",
  },
];

export function getPageMeta(pathname: string) {
  const match =
    adminNavItems.find((item) => item.href !== "/" && (pathname === item.href || pathname.startsWith(item.href + "/"))) ||
    adminNavItems.find((item) => item.href === pathname) ||
    adminNavItems[0];

  return {
    title: match.label,
    description: match.description,
    kicker: match.kicker,
  };
}