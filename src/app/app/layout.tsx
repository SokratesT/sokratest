import { AppSidebar } from "@/components/app/app-sidebar";
import { Header } from "@/components/app/header";
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
      <SidebarInset className="max-h-screen overflow-auto">
        <Header />

        <div className="z-10 mx-auto mt-14 flex w-full flex-1 flex-col p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
