import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";

const PublicPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  return redirect(ROUTES.PUBLIC.login.getPath());

  /* const { id } = await params;

  const result = await getPostById(id);

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const post = result.data.query;

  return (
    <div>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-8 py-10 lg:py-20">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              <UserIcon className="size-4" />{" "}
              {format(post.createdAt || "", "MMM dd, yyyy")}
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-2xl text-center font-regular text-5xl tracking-tighter md:text-7xl">
              {post.title}
            </h1>
            <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">
                {format(post.createdAt || "", "MMM dd, yyyy")}
              </Badge>
              <Badge variant="outline">
                {format(post.updatedAt || "", "MMM dd, yyyy")}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <Card className="mx-auto max-w-full lg:max-w-[60%]">
        <CardContent className="p-4">
          <PlateEditor options={{ value: post.content }} readOnly />
        </CardContent>
      </Card>
    </div>
  ); */
};

export default PublicPostPage;
