import {
  House,
  Mail,
  ShieldCheck,
  Component,
  ChartPie,
  Boxes,
  Server,
  UsersRound,
  StickyNote,
  Settings,
  Building2,
  FileText,
} from "lucide-react";

// Icon mapping untuk konversi dari string ke komponen Lucide
const iconMap: Record<string, any> = {
  'House': House,
  'Mail': Mail,
  'ShieldCheck': ShieldCheck,
  'Component': Component,
  'ChartPie': ChartPie,
  'Boxes': Boxes,
  'Server': Server,
  'UsersRound': UsersRound,
  'StickyNote': StickyNote,
  'Settings': Settings,
  'Building2': Building2,
  'FileText': FileText,
};

// Interface untuk menu dari API
interface UserMenu {
  id: string
  title: string
  url?: string
  icon?: string
  parent_id?: string
  order: number
  is_active: boolean
  can_view: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  can_confirm: boolean
  children?: UserMenu[]
}

// Interface untuk sidebar item
interface SidebarItem {
  title: string
  url: string
  icon: any
  isActive: boolean
  items?: Array<{
    title: string
    url: string
    circleColor: string
  }>
}

// Fungsi untuk mengkonversi menu dari API ke format sidebar
export function convertMenusToSidebarData(menus: UserMenu[]): SidebarItem[] {
  return menus.map(menu => {
    const sidebarItem: SidebarItem = {
      title: menu.title,
      url: menu.url || "#",
      icon: menu.icon ? iconMap[menu.icon] || House : House,
      isActive: menu.is_active,
    };

    // Jika menu memiliki children, konversi juga
    if (menu.children && menu.children.length > 0) {
      sidebarItem.items = menu.children.map(child => ({
        title: child.title,
        url: child.url || "#",
        circleColor: getCircleColor(child.title),
      }));
    }

    return sidebarItem;
  });
}

// Fungsi untuk mendapatkan warna circle berdasarkan title
function getCircleColor(title: string): string {
  const colorMap: Record<string, string> = {
    'Manage Users': 'bg-blue-600',
    'Manage Roles': 'bg-yellow-600',
    'Manage Menus': 'bg-purple-600',
    'Company': 'bg-primary',
    'Payment Method': 'bg-primary',
    'Notification': 'bg-yellow-500',
    'Notification Alert': 'bg-yellow-500',
  };
  
  return colorMap[title] || 'bg-gray-500';
}

// Data sidebar minimal sebagai fallback jika tidak ada data dari API
export const fallbackSidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      isActive: true,
    },
    {
      title: "Dashboard Tenant",
      url: "/dashboard-tenant",
      icon: FileText,
      isActive: true,
    },
    {
      title: "Users",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "Manage Users",
          url: "/users",
          circleColor: "bg-blue-600",
        },
        {
          title: "Manage Roles",
          url: "/roles",
          circleColor: "bg-yellow-600",
        },
      ],
    },
    {
      title: "Asset",
      url: "/asset",
      icon: Boxes,
      isActive: true,
    },
    {
      title: "Unit",
      url: "/unit",
      icon: Building2,
      isActive: true,
    },
    {
      title: "Worker",
      url: "/worker",
      icon: UsersRound,
      isActive: true,
    },
    {
      title: "Tenants",
      url: "/tenants",
      icon: Building2,
      isActive: true,
    },
    {
      title: "Task",
      url: "/task",
      icon: StickyNote,
      isActive: true,
    },
    {
      title: "Setting",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Manage Menus",
          url: "/menus",
          circleColor: "bg-purple-600",
        },
        {
          title: "Company",
          url: "/company",
          circleColor: "bg-primary",
        },
        {
          title: "Payment Method",
          url: "/payment-method",
          circleColor: "bg-primary",
        },
        {
          title: "Notification",
          url: "/settings-notification",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Notification Alert",
          url: "/notification-alert",
          circleColor: "bg-yellow-500",
        },
      ],
    },
  ],
};
