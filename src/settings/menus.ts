import {
  BookMarkedIcon,
  Building2Icon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export const sidebarInstructorMenu = [
  /* {
    title: "Posts",
    url: ROUTES.PRIVATE.posts.root.getPath(),
    icon: NewspaperIcon,
  }, */
  {
    title: "Courses",
    url: ROUTES.PRIVATE.courses.root.getPath(),
    icon: BookMarkedIcon,
  },
  {
    title: "Users",
    url: ROUTES.PRIVATE.users.root.getPath(),
    icon: UsersIcon,
  },
  {
    title: "Organisations",
    url: ROUTES.PRIVATE.organizations.root.getPath(),
    icon: Building2Icon,
  },
];

export const sidebarUserMenu = [
  {
    title: "Profile",
    url: ROUTES.PRIVATE.app.account.getPath(),
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
    href: ROUTES.PUBLIC.root.getPath(),
    description: "",
  },
  {
    title: "Blog",
    description: "The latest news about our project.",
    items: [
      {
        title: "Posts",
        href: ROUTES.PUBLIC.blog.getPath(),
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
