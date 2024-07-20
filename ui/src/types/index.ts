import { Icons } from "@/components/icons";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}

export enum Variant {
  Default = "default",
  Destructive = "destructive",
  Outline = "outline",
  Secondary = "secondary",
  Ghost = "ghost",
  Link = "link",
}

export interface Tools {
  title: string;
  description: string;
  tag: boolean;
  icon?: keyof typeof Icons;
}

export type AgentTableColItems = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export type WorkflowTableColItems = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

export type TeamTableItems = {
  email: string;
  role: string;
};

export type APIKeyTableColItems = {
  name: string;
  key: string;
  createdAt: string;
};

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;
