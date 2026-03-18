import {
  LayoutDashboard, Calendar, FileText, Star, Music, Building2,
  Settings, Moon, Sun, LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.artists", url: "/artists", icon: Music },
  { titleKey: "nav.venues", url: "/venues", icon: Building2 },
  { titleKey: "nav.schedule", url: "/schedule", icon: Calendar },
  { titleKey: "nav.contracts", url: "/contracts", icon: FileText },
  { titleKey: "nav.reviews", url: "/reviews", icon: Star },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const initials = user?.email?.slice(0, 2).toUpperCase() || "?";
  const roleLabel = user?.role === "ARTIST" ? t("common.artist") : user?.role === "VENUE" ? t("common.venue") : "—";

  const expandSidebar = () => {
    if (collapsed) {
      setOpen(true);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo + Collapse trigger */}
        <div className="flex flex-col items-center px-4 py-4 relative">
          <div className="flex items-center gap-2 w-full justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-base">
              A
            </div>
            {!collapsed && (
              <span className="font-heading font-bold text-foreground text-lg tracking-tight">
                ArtistLog
              </span>
            )}
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </div>
          {collapsed && (
            <button
              type="button"
              aria-label="Expandir menu"
              title="Expandir menu"
              onClick={() => setOpen(true)}
              className="mt-4 rounded p-1 bg-background border border-border shadow text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 20 20"><path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      onClick={expandSidebar}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2 space-y-2">
          {/* User info */}
          <button
            type="button"
            onClick={expandSidebar}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-sidebar-accent/50"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            )}
          </button>

          <Separator className="bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                expandSidebar();
                navigate("/settings");
              }}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors ${
                collapsed ? "justify-center flex-1" : "flex-1"
              } ${location.pathname === "/settings" ? "text-primary bg-sidebar-accent" : ""}`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t("nav.settings")}</span>}
            </button>

            {!collapsed && (
              <button
                onClick={toggleTheme}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
                title={theme === "dark" ? t("theme.light") : t("theme.dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>

          <button
            onClick={() => {
              expandSidebar();
              logout();
            }}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t("nav.logout")}</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
