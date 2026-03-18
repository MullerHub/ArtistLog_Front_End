import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Music, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function PublicHeader() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    if (currentY < 50) {
      setVisible(true);
    } else if (currentY > lastScrollY) {
      setVisible(false);
    } else {
      setVisible(true);
    }
    setLastScrollY(currentY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out",
        "glass border-b border-white/[0.06]",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-heading font-bold text-foreground">
            Artist<span className="text-primary">Log</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {/* Idioma fixo em português, LanguageSwitcher removido */}
          <Button variant="ghost" asChild>
            <Link to="/login">{t("header.login")}</Link>
          </Button>
          <Button asChild>
            <Link to="/register">{t("header.register")}</Link>
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Idioma fixo em português, LanguageSwitcher removido */}
          <button
            className="flex items-center justify-center text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass border-t border-white/[0.06] p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/login" onClick={() => setMobileOpen(false)}>{t("header.login")}</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link to="/register" onClick={() => setMobileOpen(false)}>{t("header.register")}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
