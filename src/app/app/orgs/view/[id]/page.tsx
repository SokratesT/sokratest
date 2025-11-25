import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
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
      <PageHeader
        title={result.data.query.name}
        actions={
          <Link
            href={ROUTES.PRIVATE.organizations.members.getPath({ id })}
            className={buttonVariants({ variant: "default" })}
          >
            Manage Users
          </Link>
        }
      />
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
