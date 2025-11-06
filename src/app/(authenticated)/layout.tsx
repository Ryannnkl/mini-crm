import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";
import { getUserData } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserData();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="w-full h-full p-4">
        <SidebarTrigger />
        <Suspense>{children}</Suspense>
      </main>
    </SidebarProvider>
  );
}
