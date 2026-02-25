import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProdBanner } from "@/components/ProdBanner";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <ProdBanner />
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <header className="h-12 flex items-center border-b border-border px-4 shrink-0">
              <SidebarTrigger className="text-muted-foreground" />
            </header>
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
