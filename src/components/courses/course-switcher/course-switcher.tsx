"use client";

import { setActiveCourse } from "@/actions/course";
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
} from "@/components/ui/sidebar";
import type { Course } from "@/db/schema/courses";
import { routes } from "@/settings/routes";
import { BookMarkedIcon, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CourseSwitcher = ({
  availableCourses,
  activeCourse,
}: { availableCourses: Course[]; activeCourse: Course | undefined }) => {
  const router = useRouter();

  const handleCourseChange = async (course: Course) => {
    console.log(course);

    await setActiveCourse({ courseId: course.id });

    router.push(routes.app.path);
    toast.success(`Course changed to ${course.title}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
