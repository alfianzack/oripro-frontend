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
} from "lucide-react";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
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
