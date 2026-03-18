import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function AuthenticatedLayout() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Outlet />
            <MobileBottomNav />
          </div>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}
