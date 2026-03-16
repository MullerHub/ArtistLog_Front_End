import { useAuth } from "@/contexts/AuthContext";
import { InternalHeader } from "@/components/InternalHeader";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Music, Building2, Calendar, FileText, Star, TrendingUp,
  Users, MapPin, ArrowRight, Sparkles, Eye, MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

interface StatCard {
  labelKey: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color: "primary" | "secondary" | "success";
}

interface QuickAction {
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
  url: string;
}

const ARTIST_STATS: StatCard[] = [
  { labelKey: "dashboard.profileViews", value: "342", icon: Eye, trend: "+18%", color: "primary" },
  { labelKey: "dashboard.proposalsReceived", value: "12", icon: FileText, trend: "+3", color: "secondary" },
  { labelKey: "dashboard.scheduledShows", value: "4", icon: Calendar, color: "success" },
  { labelKey: "dashboard.averageRating", value: "4.8", icon: Star, color: "primary" },
];

const VENUE_STATS: StatCard[] = [
  { labelKey: "dashboard.artistsFound", value: "86", icon: Users, trend: "+24", color: "primary" },
  { labelKey: "dashboard.proposalsSent", value: "15", icon: FileText, trend: "+5", color: "secondary" },
  { labelKey: "dashboard.confirmedEvents", value: "7", icon: Calendar, color: "success" },
  { labelKey: "dashboard.venueRating", value: "4.6", icon: Star, color: "primary" },
];

const ARTIST_ACTIONS: QuickAction[] = [
  { labelKey: "dashboard.exploreVenues", descKey: "dashboard.findStages", icon: Building2, url: "/venues" },
  { labelKey: "dashboard.mySchedule", descKey: "dashboard.manageShows", icon: Calendar, url: "/schedule" },
  { labelKey: "dashboard.contracts", descKey: "dashboard.viewProposals", icon: FileText, url: "/contracts" },
  { labelKey: "dashboard.reviewsAction", descKey: "dashboard.checkFeedback", icon: Star, url: "/reviews" },
];

const VENUE_ACTIONS: QuickAction[] = [
  { labelKey: "dashboard.searchArtists", descKey: "dashboard.findTalent", icon: Music, url: "/artists" },
  { labelKey: "dashboard.mySchedule", descKey: "dashboard.manageEvents", icon: Calendar, url: "/schedule" },
  { labelKey: "dashboard.contracts", descKey: "dashboard.sentProposals", icon: FileText, url: "/contracts" },
  { labelKey: "dashboard.reviewsAction", descKey: "dashboard.artistFeedback", icon: Star, url: "/reviews" },
];

function colorClass(c: "primary" | "secondary" | "success") {
  switch (c) {
    case "primary": return "bg-primary/10 text-primary";
    case "secondary": return "bg-secondary/10 text-secondary";
    case "success": return "bg-success/10 text-success";
  }
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isArtist = user?.role === "ARTIST";
  const stats = isArtist ? ARTIST_STATS : VENUE_STATS;
  const actions = isArtist ? ARTIST_ACTIONS : VENUE_ACTIONS;
  const greeting = isArtist ? t("common.artist") : t("common.venue");

  const tips = isArtist
    ? [t("dashboard.artistTip1"), t("dashboard.artistTip2"), t("dashboard.artistTip3")]
    : [t("dashboard.venueTip1"), t("dashboard.venueTip2"), t("dashboard.venueTip3")];

  return (
    <>
      <InternalHeader title={t("dashboard.title")} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {isArtist ? <Music className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground">
                    {t("dashboard.hello", { role: greeting })}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.labelKey} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
                <div className="glass rounded-xl p-4 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass(s.color)}`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    {s.trend && (
                      <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                        <TrendingUp className="h-3 w-3" /> {s.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(s.labelKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <h3 className="font-heading font-semibold text-foreground mb-3">{t("dashboard.quickActions")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {actions.map((a) => (
                <button
                  key={a.url}
                  onClick={() => navigate(a.url)}
                  className="glass rounded-xl p-4 text-left card-hover group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <a.icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t(a.labelKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(a.descKey)}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-semibold text-foreground text-sm">{t("dashboard.tipsTitle")}</h3>
              </div>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
