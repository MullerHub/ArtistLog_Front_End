import { Link } from "react-router-dom";
import {
  Music, Search, FileText, CalendarDays, ArrowRight, Mic, Building2,
  Star, Users, MapPin, Shield, Zap, TrendingUp, CheckCircle2, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return Math.round(v).toLocaleString("pt-BR");
    return Math.round(v).toString();
  });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [count, target]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}

const metrics = [
  { value: 2400, suffix: "+", label: "Artistas cadastrados" },
  { value: 850, suffix: "+", label: "Contratantes ativos" },
  { value: 12000, suffix: "+", label: "Conexões realizadas" },
  { value: 98, suffix: "%", label: "Satisfação" },
];

const forArtists = [
  { icon: Star, title: "Mostre seu talento", desc: "Perfil profissional com fotos, gêneros, cachê e portfólio para se destacar." },
  { icon: CalendarDays, title: "Gerencie sua agenda", desc: "Defina horários disponíveis e receba propostas que encaixam no seu calendário." },
  { icon: TrendingUp, title: "Cresça sua carreira", desc: "Mais visibilidade, mais shows, mais oportunidades — tudo num só lugar." },
];

const forVenues = [
  { icon: Search, title: "Encontre o artista ideal", desc: "Filtros por gênero, cidade, cachê e disponibilidade para achar o match perfeito." },
  { icon: FileText, title: "Contratos seguros", desc: "Propostas, negociação e assinatura digital integrada — sem papelada." },
  { icon: MapPin, title: "Descubra talentos próximos", desc: "Busca por localização para encontrar artistas na sua região." },
];

const howItWorks = [
  { step: "01", title: "Crie seu perfil", desc: "Cadastre-se como artista ou contratante em menos de 2 minutos." },
  { step: "02", title: "Descubra e conecte", desc: "Explore perfis, filtre por gênero e localização, encontre o match perfeito." },
  { step: "03", title: "Feche o deal", desc: "Envie propostas, negocie condições e formalize com contrato digital." },
];

const testimonials = [
  { name: "Lucas Mendes", role: "DJ / Produtor", text: "Consegui 3x mais shows depois que criei meu perfil no ArtistLog. A plataforma mudou minha carreira.", rating: 5 },
  { name: "Marina Oliveira", role: "Gerente — Bar Eclipse", text: "Antes levava dias pra encontrar artistas. Agora em 10 minutos já tenho propostas na mesa.", rating: 5 },
  { name: "Banda Frequency", role: "Rock / Indie", text: "A agenda integrada é incrível. Sem conflito de datas, sem confusão. Tudo profissional.", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-background" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[150px]" />
          <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-secondary/6 blur-[120px]" />
          <div className="absolute left-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-primary/4 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <Zap className="h-3.5 w-3.5" />
              <span>A única plataforma B2B para Artistas e Contratantes no Brasil</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Seu talento merece
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              o palco certo
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Conectamos artistas a contratantes com ferramentas de descoberta, contratos digitais e gestão de agenda.
            Sem intermediários. Sem burocracia.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 gap-2" asChild>
              <Link to="/register">
                <Mic className="h-4 w-4" />
                Sou Artista
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 gap-2 border-white/10 hover:bg-white/5" asChild>
              <Link to="/register">
                <Building2 className="h-4 w-4" />
                Sou Contratante
              </Link>
            </Button>
          </motion.div>

          {/* Metrics */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-heading font-bold text-primary">
                  <AnimatedCounter target={m.value} suffix={m.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="border-y border-white/[0.06] bg-card/30 py-6">
        <div className="mx-auto max-w-5xl px-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Contratos com assinatura digital</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Cadastro gratuito</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <span>Comunidade ativa em todo o Brasil</span>
          </div>
        </div>
      </section>

      {/* FOR ARTISTS */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/4 blur-[150px] pointer-events-none" />
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-4">
                <Mic className="h-3 w-3" /> Para Artistas
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                Mais shows.{" "}
                <span className="text-primary">Mais controle.</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Crie um perfil profissional, defina seus termos e deixe as oportunidades chegarem até você.
              </p>
              <div className="space-y-5">
                {forArtists.map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-4"
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-0.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button className="mt-8 gap-2" asChild>
                <Link to="/register">
                  Criar perfil de artista <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Artist preview card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass rounded-2xl p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Music className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground">DJ Muller</h4>
                    <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs text-success ring-1 ring-success/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    Disponível
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["Eletrônico", "House", "Techno", "Casamento"].map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary ring-1 ring-primary/20">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4 fill-primary" />
                    <span className="font-medium">4.9</span>
                    <span className="text-muted-foreground">(127)</span>
                  </div>
                  <span className="text-muted-foreground">Cachê: <span className="text-foreground font-medium">R$ 1.500</span></span>
                </div>
                <div className="mt-4 h-px bg-white/[0.06]" />
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1 gap-1"><Play className="h-3 w-3" /> Ver perfil</Button>
                  <Button size="sm" variant="outline" className="flex-1 border-white/10">Enviar proposta</Button>
                </div>
              </div>
              {/* Floating badges */}
              <motion.div
                className="absolute -top-3 -right-3 glass rounded-lg px-3 py-1.5 text-xs"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <span className="text-primary font-medium">+23 views</span> esta semana
              </motion.div>
              <motion.div
                className="absolute -bottom-3 -left-3 glass rounded-lg px-3 py-1.5 text-xs"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              >
                🎵 <span className="text-success font-medium">3 propostas</span> pendentes
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOR VENUES */}
      <section className="relative py-24 px-4 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-secondary/4 blur-[150px] pointer-events-none" />
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Venue preview card */}
            <motion.div
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass rounded-2xl p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground">Bar Eclipse</h4>
                    <p className="text-sm text-muted-foreground">Rio de Janeiro, RJ</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg bg-muted/30 p-3 text-center">
                    <p className="text-lg font-heading font-bold text-foreground">350</p>
                    <p className="text-xs text-muted-foreground">Capacidade</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 text-center">
                    <p className="text-lg font-heading font-bold text-primary">4.7</p>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Infraestrutura</p>
                  <p className="text-sm text-foreground">Palco completo, PA 5k watts, iluminação LED, camarim, estacionamento</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Lapa, Rio de Janeiro</span>
                </div>
                <Button size="sm" className="w-full gap-1">
                  <Search className="h-3 w-3" /> Buscar artistas disponíveis
                </Button>
              </div>
              <motion.div
                className="absolute -top-3 -left-3 glass rounded-lg px-3 py-1.5 text-xs"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <span className="text-secondary font-medium">12 artistas</span> disponíveis
              </motion.div>
              <motion.div
                className="absolute -bottom-3 -right-3 glass rounded-lg px-3 py-1.5 text-xs"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.3 }}
              >
                📋 <span className="text-primary font-medium">Contrato</span> assinado!
              </motion.div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 text-xs text-secondary mb-4">
                <Building2 className="h-3 w-3" /> Para Contratantes
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                O artista ideal.{" "}
                <span className="text-secondary">Sem complicação.</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Busque por gênero, localização e disponibilidade. Envie propostas e feche contratos em minutos.
              </p>
              <div className="space-y-5">
                {forVenues.map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-4"
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-secondary/10 ring-1 ring-secondary/20 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-0.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button className="mt-8 gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground" asChild>
                <Link to="/register">
                  Criar perfil de contratante <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 px-4 border-t border-white/[0.04]">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Em três passos simples, você está pronto para se conectar.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                className="relative glass rounded-xl p-6 text-center card-hover"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="text-4xl font-heading font-bold text-primary/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-white/10">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-24 px-4 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 dot-background opacity-30" />
        <div className="mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Quem usa, recomenda
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Veja o que artistas e contratantes estão dizendo sobre o ArtistLog.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass rounded-xl p-6 card-hover"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-foreground">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-4">
        <motion.div
          className="mx-auto max-w-3xl relative overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-secondary/10" />
          <div className="absolute inset-0 grid-background" />
          <div className="relative glass-strong rounded-2xl p-10 sm:p-14 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Music className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Pronto para fazer parte?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Junte-se a milhares de artistas e contratantes que já estão revolucionando a forma de fazer eventos no Brasil.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 gap-2" asChild>
                <Link to="/register">
                  Criar conta grátis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="w-full sm:w-auto text-base text-muted-foreground" asChild>
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Grátis para sempre • Sem cartão de crédito</p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Music className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-foreground">
              Artist<span className="text-primary">Log</span>
            </span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Cadastrar</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ArtistLog. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
