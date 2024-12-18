import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
} from "@/components/ui/sidebar";
import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { searchParamsCache } from "@/lib/searchParams";
import { buckets } from "@/settings/buckets";
import { routes } from "@/settings/routes";
import { count, desc, eq, ilike } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { BucketSelect } from "./bucket-select";
import { DefaultPagination } from "./default-pagination";
import { FileListEntry } from "./file-list-entry";
import UploadComponent from "./UploadComponent";
import { SearchInput } from "./search-input";
import { gt, lt, and } from "drizzle-orm";

const FileSidebar = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { page, bucket, search } = await searchParamsCache.parse(searchParams);

  if (page < 1 || !buckets.map((b) => b.name).includes(bucket)) {
    redirect(routes.app.sub.up.path);
  }

  const itemsPerPage = 20;

  const [fileCount] = await db
    .select({ count: count(files.id) })
    .from(files)
    .where(
      and(eq(files.bucket, bucket), ilike(files.originalName, `%${search}%`)),
    );

  const filesInfo = await db
    .select()
    .from(files)
    .where(
      and(eq(files.bucket, bucket), ilike(files.originalName, `%${search}%`)),
    )
    .orderBy(desc(files.createdAt))
    .limit(itemsPerPage)
    .offset((page - 1) * itemsPerPage);

  return (
    <Sidebar
      collapsible="none"
      className="hidden h-full max-h-full w-full flex-1 border-r md:flex"
    >
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between gap-2">
          <BucketSelect />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Upload</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Upload your files to the server.
                </DialogDescription>
              </DialogHeader>
              <UploadComponent />
            </DialogContent>
          </Dialog>
        </div>
        <SearchInput />
        {/* <SidebarInput placeholder="Type to search..." /> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {filesInfo.map((file) => (
              <FileListEntry fileInfo={file} key={file.id} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <DefaultPagination
          maxPage={Math.ceil(fileCount.count / itemsPerPage)}
        />
      </SidebarFooter>
    </Sidebar>
  );
};

export { FileSidebar };
