import {
  Building2Icon,
  FilesIcon,
  HomeIcon,
  MessagesSquareIcon,
  NewspaperIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { routes } from "./routes";

export const sidebarMenu = [
  {
    title: "Home",
    url: routes.app.path,
    icon: HomeIcon,
  },
  {
    title: "Chat",
    url: routes.app.sub.chat.path,
    icon: MessagesSquareIcon,
  },
  {
    title: "Posts",
    url: routes.app.sub.posts.path,
    icon: NewspaperIcon,
  },
  {
    title: "Files",
    url: routes.app.sub.up.path,
    icon: FilesIcon,
  },
  {
    title: "Users",
    url: routes.app.sub.users.path,
    icon: UsersIcon,
  },
  {
    title: "Organisations",
    url: routes.app.sub.organizations.path,
    icon: Building2Icon,
  },
];

export const sidebarUserMenu = [
  {
    title: "Profile",
    url: routes.app.sub.account.path,
    icon: UserIcon,
  },
  {
    title: "Settings",
    url: "#",
    icon: SettingsIcon,
  },
];

export const navigationItems = [
  {
    title: "Home",
    href: "/",
    description: "",
  },
  {
    title: "Blog",
    description: "The latest news about our project.",
    items: [
      {
        title: "Posts",
        href: "/blog",
      },
      {
        title: "Statistics",
        href: "#",
      },
      {
        title: "RAG Pipeline",
        href: "#",
      },
    ],
  },
  {
    title: "About",
    description: "Learn more about our project.",
    items: [
      {
        title: "About us",
        href: "#",
      },
      {
        title: "Funding",
        href: "#",
      },
      {
        title: "Roadmap",
        href: "#",
      },
      {
        title: "Contact us",
        href: "#",
      },
    ],
  },
];
