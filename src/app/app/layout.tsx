import { Header } from "@/components/app/header";
import { AppSidebar } from "@/components/app/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/db/queries/auth";
import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) {
    redirect(ROUTES.PUBLIC.login.getPath());
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="max-h-screen">
        <Header />

        <div className="z-10 mx-auto mt-14 flex w-full flex-1 flex-col px-2 py-6 md:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
