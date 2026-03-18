import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Music, Mic, Building2, ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authService } from "@/services/auth-service";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { CitySearch } from "@/components/CitySearch";
import type { City } from "@/types/location";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Role = "ARTIST" | "VENUE" | null;

const artistSchema = z.object({
  stage_name: z.string().min(1, "Nome artístico é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a senha"),
  about_me: z.string().optional(),
  cache_base: z.coerce.number().min(0, "Valor inválido"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

const venueSchema = z.object({
  venue_name: z.string().min(1, "Nome do venue é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a senha"),
  capacity: z.coerce.number().min(1, "Capacidade é obrigatória"),
  infrastructure: z.string().min(1, "Infraestrutura é obrigatória"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type ArtistForm = z.infer<typeof artistSchema>;
type VenueForm = z.infer<typeof venueSchema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const [role, setRole] = useState<Role>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background grid-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/3 bottom-1/4 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="outline" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              Artist<span className="text-primary">Log</span>
            </span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!role ? (
            <RoleSelector key="role" onSelect={setRole} />
          ) : role === "ARTIST" ? (
            <ArtistSignup key="artist" onBack={() => setRole(null)} />
          ) : (
            <VenueSignup key="venue" onBack={() => setRole(null)} />
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("register.haveAccount")}{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t("register.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="text-center text-2xl font-heading font-bold text-foreground mb-2">
        {t("register.title")}
      </h2>
      <p className="text-center text-muted-foreground mb-8">{t("register.subtitle")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => onSelect("ARTIST")}
          className="glass rounded-xl p-6 text-left card-hover group cursor-pointer"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-1">{t("register.iAmArtist")}</h3>
          <p className="text-sm text-muted-foreground">{t("register.artistDesc")}</p>
        </button>

        <button
          onClick={() => onSelect("VENUE")}
          className="glass rounded-xl p-6 text-left card-hover group cursor-pointer"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/20 group-hover:bg-secondary/20 transition-colors">
            <Building2 className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-1">{t("register.iAmVenue")}</h3>
          <p className="text-sm text-muted-foreground">{t("register.venueDesc")}</p>
        </button>
      </div>
    </motion.div>
  );
}

function ArtistSignup({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ArtistForm>({
    resolver: zodResolver(artistSchema),
  });

  const artistCity = watch("city");
  const artistState = watch("state");

  const handleArtistCitySelect = (city: City) => {
    setValue("city", city.name, { shouldValidate: true, shouldDirty: true });
    setValue("state", city.state, { shouldValidate: true, shouldDirty: true });
  };

  const addTag = () => {
    const tg = tagInput.trim();
    if (tg && !tags.includes(tg)) {
      setTags([...tags, tg]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((tg) => tg !== tag));

  const onSubmit = async (data: ArtistForm) => {
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...rest } = data;
      await authService.signupArtist({
        stage_name: rest.stage_name!,
        email: rest.email!,
        password: rest.password!,
        cache_base: rest.cache_base!,
        city: rest.city!,
        state: rest.state!,
      });
      toast.success(t("register.success"));
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("register.error"));
    }
  };

  return (
    <motion.div
      className="glass rounded-2xl p-8"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </button>
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">{t("register.artistSignup")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-2">
          <Label>{t("register.stageName")} *</Label>
          <Input placeholder="DJ Muller" className="bg-muted/50 border-white/10" {...register("stage_name")} />
          {errors.stage_name && <p className="text-xs text-destructive">{errors.stage_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("register.email")} *</Label>
          <Input type="email" placeholder="seu@email.com" className="bg-muted/50 border-white/10" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("register.password")} *</Label>
            <Input type="password" placeholder="••••••" className="bg-muted/50 border-white/10" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t("register.confirmPassword")} *</Label>
            <Input type="password" placeholder="••••••" className="bg-muted/50 border-white/10" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("register.aboutYou")}</Label>
          <Textarea placeholder={t("register.aboutYouPlaceholder")} className="bg-muted/50 border-white/10 min-h-[80px]" {...register("about_me")} />
        </div>

        <div className="space-y-2">
          <Label>{t("register.baseFee")} *</Label>
          <Input type="number" placeholder="1500" className="bg-muted/50 border-white/10" {...register("cache_base")} />
          {errors.cache_base && <p className="text-xs text-destructive">{errors.cache_base.message}</p>}
        </div>

        <div className="space-y-2">
          <CitySearch
            value={artistCity || ""}
            onCitySelect={handleArtistCitySelect}
            error={errors.city?.message}
            label="Cidade (comece a digitar para buscar)"
            placeholder="Digite o nome da cidade..."
            required
          />
          {artistState && (
            <p className="text-xs text-muted-foreground">
              Estado: <strong>{artistState}</strong>
            </p>
          )}
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("state")} />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>{t("register.tagsGenres")}</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: DJ, Rock, Casamento"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              className="bg-muted/50 border-white/10"
            />
            <Button type="button" variant="outline" onClick={addTag} className="border-white/10 shrink-0">+</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tg) => (
                <span key={tg} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary ring-1 ring-primary/20">
                  {tg}
                  <button type="button" onClick={() => removeTag(tg)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("register.phone")}</Label>
            <Input placeholder="+55 11 99999-9999" className="bg-muted/50 border-white/10" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>{t("register.whatsapp")}</Label>
            <Input placeholder="+55 11 99999-9999" className="bg-muted/50 border-white/10" {...register("whatsapp")} />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("register.creating")}</> : t("register.createArtist")}
        </Button>
      </form>
    </motion.div>
  );
}

function VenueSignup({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VenueForm>({
    resolver: zodResolver(venueSchema),
  });

  const venueCity = watch("city");
  const venueState = watch("state");

  const handleVenueCitySelect = (city: City) => {
    setValue("city", city.name, { shouldValidate: true, shouldDirty: true });
    setValue("state", city.state, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: VenueForm) => {
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...rest } = data;
      await authService.signupVenue({
        venue_name: rest.venue_name!,
        email: rest.email!,
        password: rest.password!,
        capacity: rest.capacity!,
        infrastructure: rest.infrastructure!,
        city: rest.city!,
        state: rest.state!,
      });
      toast.success(t("register.success"));
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t("register.error"));
    }
  };

  return (
    <motion.div
      className="glass rounded-2xl p-8"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </button>
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">{t("register.venueSignup")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-2">
          <Label>{t("register.venueName")} *</Label>
          <Input placeholder="Bar do Zé" className="bg-muted/50 border-white/10" {...register("venue_name")} />
          {errors.venue_name && <p className="text-xs text-destructive">{errors.venue_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("register.email")} *</Label>
          <Input type="email" placeholder="contato@venue.com" className="bg-muted/50 border-white/10" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("register.password")} *</Label>
            <Input type="password" placeholder="••••••" className="bg-muted/50 border-white/10" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t("register.confirmPassword")} *</Label>
            <Input type="password" placeholder="••••••" className="bg-muted/50 border-white/10" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("register.capacity")} *</Label>
          <Input type="number" placeholder="200" className="bg-muted/50 border-white/10" {...register("capacity")} />
          {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("register.infrastructureLabel")} *</Label>
          <Textarea placeholder={t("register.infrastructurePlaceholder")} className="bg-muted/50 border-white/10 min-h-[80px]" {...register("infrastructure")} />
          {errors.infrastructure && <p className="text-xs text-destructive">{errors.infrastructure.message}</p>}
        </div>

        <div className="space-y-2">
          <CitySearch
            value={venueCity || ""}
            onCitySelect={handleVenueCitySelect}
            error={errors.city?.message}
            label="Cidade (comece a digitar para buscar)"
            placeholder="Digite o nome da cidade..."
            required
          />
          {venueState && (
            <p className="text-xs text-muted-foreground">
              Estado: <strong>{venueState}</strong>
            </p>
          )}
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("state")} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("register.creating")}</> : t("register.createVenue")}
        </Button>
      </form>
    </motion.div>
  );
}
