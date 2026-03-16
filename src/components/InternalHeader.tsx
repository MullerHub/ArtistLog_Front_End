import { NotificationCenter } from "@/components/NotificationCenter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface InternalHeaderProps {
  title: string;
}

export function InternalHeader({ title }: InternalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4">
      <h1 className="font-heading font-bold text-lg text-foreground flex-1 truncate">{title}</h1>
      <LanguageSwitcher />
      <NotificationCenter />
    </header>
  );
}
