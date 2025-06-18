import Link from "next/link";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationById } from "@/db/queries/organizations";
import { ROUTES } from "@/settings/routes";

const ViewCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await getOrganizationById(id);

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  if (!result.data.query) {
    return <Placeholder>No such organisation</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          {result.data.query.name}
        </h4>
        <div className="flex gap-2">
          <Link
            href={ROUTES.PRIVATE.organizations.members.getPath({ id })}
            className={buttonVariants({ variant: "default" })}
          >
            Manage Users
          </Link>
        </div>
      </div>
      <div className="flex justify-center">
        <Card className="max-w-full lg:w-[60%]">
          <CardContent className="p-4">
            {result.data.query.id} | {result.data.query.slug}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCoursePage;
