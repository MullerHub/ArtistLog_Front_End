import { useState, useEffect } from "react";
import { InternalHeader } from "@/components/InternalHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/lib/api-client";
import {
  Activity, Server, Clock, User, Wifi, WifiOff, RefreshCw, Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function DebugPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [latency, setLatency] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const baseUrl = API_BASE_URL;
  const token = (() => { try { return localStorage.getItem("artistlog_token"); } catch { return null; } })();

  const checkHealth = async () => {
    setChecking(true);
    setApiStatus("checking");
    const start = performance.now();
    try {
      const res = await fetch(`${baseUrl}/health`, { method: "GET", signal: AbortSignal.timeout(10000) });
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setApiStatus(res.ok ? "online" : "offline");
    } catch {
      setLatency(null);
      setApiStatus("offline");
    }
    setLastCheck(new Date());
    setChecking(false);
  };

  useEffect(() => { checkHealth(); }, []);

  const statusColor = apiStatus === "online" ? "bg-success/10 text-success border-success/20" :
    apiStatus === "offline" ? "bg-destructive/10 text-destructive border-destructive/20" :
    "bg-muted/50 text-muted-foreground border-border";

  const statusIcon = apiStatus === "online" ? <Wifi className="h-4 w-4" /> :
    apiStatus === "offline" ? <WifiOff className="h-4 w-4" /> :
    <RefreshCw className="h-4 w-4 animate-spin" />;

  return (
    <>
      <InternalHeader title={t("debug.title")} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> {t("debug.apiConnectivity")}
                </h3>
                <Button variant="outline" size="sm" onClick={checkHealth} disabled={checking}>
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${checking ? "animate-spin" : ""}`} />
                  {t("debug.test")}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/20 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{t("debug.status")}</p>
                  <Badge className={statusColor}>
                    {statusIcon}
                    <span className="ml-1">
                      {apiStatus === "online" ? t("debug.online") : apiStatus === "offline" ? t("debug.offline") : t("debug.checking")}
                    </span>
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{t("debug.latency")}</p>
                  <p className="text-sm font-medium text-foreground">
                    {latency !== null ? `${latency}ms` : "—"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{t("debug.lastCheck")}</p>
                  <p className="text-sm font-medium text-foreground">
                    {lastCheck ? lastCheck.toLocaleTimeString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" /> {t("debug.configuration")}
              </h3>
              <div className="space-y-2">
                <InfoRow label={t("debug.baseUrl")} value={baseUrl} />
                <InfoRow label={t("debug.environment")} value={import.meta.env.DEV ? t("debug.development") : t("debug.production")} />
                <InfoRow label="VITE_API_URL" value={import.meta.env.VITE_API_URL || "(—)"} />
                <InfoRow label={t("debug.hostname")} value={typeof window !== "undefined" ? window.location.hostname : "—"} />
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> {t("debug.session")}
              </h3>
              <div className="space-y-2">
                <InfoRow label={t("debug.authenticated")} value={isAuthenticated ? t("debug.yes") : t("debug.no")} />
                <InfoRow label={t("debug.userId")} value={user?.id || "—"} />
                <InfoRow label={t("debug.email")} value={user?.email || "—"} />
                <InfoRow label={t("debug.role")} value={user?.role || "—"} />
                <InfoRow label={t("debug.token")} value={token ? `${token.slice(0, 20)}...` : `(${t("debug.none")})`} />
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> {t("debug.quickSignals")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <SignalCard label={t("debug.navigatorOnline")} ok={navigator.onLine} />
                <SignalCard label={t("debug.localStorage")} ok={(() => { try { localStorage.setItem("_test", "1"); localStorage.removeItem("_test"); return true; } catch { return false; } })()} />
                <SignalCard label={t("debug.tokenPresent")} ok={!!token} />
                <SignalCard label={t("debug.userInContext")} ok={!!user} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-foreground max-w-[60%] truncate text-right">{value}</span>
    </div>
  );
}

function SignalCard({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`p-3 rounded-lg border text-center ${ok ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
      <div className={`h-3 w-3 rounded-full mx-auto mb-1.5 ${ok ? "bg-success" : "bg-destructive"}`} />
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
