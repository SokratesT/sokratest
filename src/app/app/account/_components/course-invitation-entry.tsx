import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseById } from "@/db/queries/course";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { format } from "date-fns";
import { BookMarkedIcon, CalendarIcon, Clock4Icon } from "lucide-react";
import { Suspense } from "react";
import { CourseInvitationActions } from "./course-invitation-actions";

interface CourseInvitationEntryProps {
  invitation: CourseInvitation;
}

async function CourseInvitationContent({
  invitation,
}: CourseInvitationEntryProps) {
  const courseResult = await getCourseById(invitation.courseId);
  const course = courseResult.success ? courseResult.data.query : null;
  const isPending = invitation.status === "pending";

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarkedIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">
              {course?.title || "Unknown Course"}
            </CardTitle>
          </div>
          <Badge
            variant={
              invitation.status === "pending"
                ? "outline"
                : invitation.status === "accepted"
                  ? "default"
                  : "destructive"
            }
          >
            {invitation.status.charAt(0).toUpperCase() +
              invitation.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {course?.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>
              Invited on {format(invitation.createdAt || "", "MMM d, yyyy")}
            </span>
          </div>
          {isPending && (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Clock4Icon className="h-3.5 w-3.5" />
              <span>
                Expires on {format(invitation.expiresAt, "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {isPending && (
        <CardFooter>
          <CardAction>
            <CourseInvitationActions invitation={invitation} />
          </CardAction>
        </CardFooter>
      )}
    </Card>
  );
}

export function CourseInvitationEntry({
  invitation,
}: CourseInvitationEntryProps) {
  return (
    <Suspense
      fallback={
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-1/3" />
          </CardFooter>
        </Card>
      }
    >
      <CourseInvitationContent invitation={invitation} />
    </Suspense>
  );
}
