import { LayoutDashboard, Search, Calendar, FileText, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTranslation } from "react-i18next";

const MOBILE_NAV = [
  { titleKey: "nav.home", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.search", url: "/artists", icon: Search },
  { titleKey: "nav.schedule", url: "/schedule", icon: Calendar },
  { titleKey: "nav.contracts", url: "/contracts", icon: FileText },
  { titleKey: "nav.config", url: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t(item.titleKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
