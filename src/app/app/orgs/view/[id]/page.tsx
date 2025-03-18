import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getOrganizationById } from "@/db/queries/organizations";
import Link from "next/link";

const ViewCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { query } = await getOrganizationById(id);

  if (!query) {
    return <Placeholder>No such organisation</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          {query.name}
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/app/orgs/view/${id}/members`}>Manage Users</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Card className="max-w-full lg:w-[60%]">
          <CardContent className="p-4">
            {query.id} | {query.slug}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCoursePage;
