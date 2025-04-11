"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { setActiveCourse } from "@/db/actions/course";
import type { Course } from "@/db/schema/course";
import { ROUTES } from "@/settings/routes";
import { BookMarkedIcon, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CourseSwitcher = ({
  availableCourses,
  activeCourse,
}: { availableCourses: Course[]; activeCourse: Course | undefined | null }) => {
  const router = useRouter();

  const { setOpenMobile } = useSidebar();

  const handleCourseChange = async (course: Course) => {
    toast.promise(setActiveCourse({ courseId: course.id }), {
      loading: `Changing course to ${course.title}`,
      success: `Course changed to ${course.title}`,
      error: `Failed to change course`,
    });

    setOpenMobile(false);

    router.push(ROUTES.PRIVATE.root.getPath());
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              closeSidebar={false}
              className="border bg-background/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookMarkedIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                {!activeCourse ? (
                  <span>Select a course</span>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-semibold">Course</span>
                    <span className="line-clamp-2 text-xs">
                      {activeCourse?.title}
                    </span>
                  </div>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {availableCourses.map((course) => (
              <DropdownMenuItem
                key={course.id}
                onSelect={() => handleCourseChange(course)}
              >
                {course.title}
                {activeCourse?.id === course.id && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { CourseSwitcher };
