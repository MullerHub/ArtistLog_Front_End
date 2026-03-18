// Componente removido: sistema agora é apenas em português.
// Componente removido: sistema agora é apenas em português.
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "pt-BR", label: "🇧🇷 Português", short: "PT" },
  { code: "en", label: "🇺🇸 English", short: "EN" },
];

export function LanguageSwitcher({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  const { i18n } = useTranslation();
  const activeLanguage = String(i18n.resolvedLanguage || i18n.language || "pt-BR");
  const isActiveLanguage = (code: string) => activeLanguage === code || activeLanguage.startsWith(`${code}-`);
  const current = LANGUAGES.find((l) => isActiveLanguage(l.code)) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" className="relative" title={current.label}>
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`cursor-pointer ${isActiveLanguage(lang.code) ? "bg-accent font-medium" : ""}`}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
