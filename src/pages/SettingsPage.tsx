import { useState, useRef, useEffect } from "react";
import { InternalHeader } from "@/components/InternalHeader";
import { apiClient } from "@/lib/api-client";
import { resolvePhotoUrl } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { GENRES, EVENT_TYPES } from "@/types/artist";
import { artistsService } from "@/services/artists-service";
import { venuesService } from "@/services/venues-service";
import { citiesService, type City } from "@/services/cities-service";
import type { Artist } from "@/types/artist";
import type { Venue } from "@/types/venue";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  User, Camera, Upload, Star, MapPin,
  Save, Trash2, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// City Search Component
function CitySearch({ value, onChange, placeholder = "Digite para buscar cidade..." }: { value: City | null; onChange: (city: City) => void; placeholder?: string }) {
  const [search, setSearch] = useState(value ? `${value.nome} - ${value.uf}` : "");
  const [results, setResults] = useState<City[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSearch(`${value.nome} - ${value.uf}`);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length >= 2) {
      citiesService.search(value)
        .then((data) => {
          setResults(data);
        })
        .catch((err) => {
          console.error("[CitySearch] Error:", err);
          setResults([]);
        });
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        className="mt-1"
        value={search}
        onChange={handleSearchChange}
        onFocus={() => search.length >= 2 && setShowDropdown(true)}
        placeholder={placeholder}
      />
      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((c) => (
            <button
              key={`${c.nome}-${c.uf}`}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
              onClick={() => {
                onChange(c);
                setSearch(`${c.nome} - ${c.uf}`);
                setShowDropdown(false);
              }}
            >
              {c.nome} - {c.uf}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isArtist = user?.role === "ARTIST" || !user;

  return (
    <>
      <InternalHeader title="Configurações" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="glass">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
              <TabsTrigger value="account">Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              {isArtist ? <ArtistProfileForm /> : <VenueProfileForm />}
            </TabsContent>

            <TabsContent value="photos" className="mt-4">
              <PhotosManager />
            </TabsContent>

            <TabsContent value="preferences" className="mt-4">
              <PreferencesForm />
            </TabsContent>

            <TabsContent value="account" className="mt-4">
              <AccountInfo />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

function ArtistProfileForm() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [artistData, setArtistData] = useState<Artist | null>(null);

  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [cacheBase, setCacheBase] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await artistsService.getById(user.id);
        setArtistData(data);
        setStageName(data.stage_name || "");
        setBio(data.bio || "");
        setAboutMe(data.about_me || "");
        setPhone(data.phone || "");
        setWhatsapp(data.whatsapp || "");
        setWebsite(data.website || "");
        if (data.city && data.state) {
          setCity({ id: "", nome: data.city, estado: data.state, uf: data.state });
        }
        setCacheBase(data.cache_base?.toString() || "");
        setGenres(data.genres || []);
        setEventTypes(data.event_types || []);
      } catch {
        toast.error("Erro ao carregar dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [user?.id]);

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  const toggleEventType = (e: string) =>
    setEventTypes((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const save = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await apiClient.patch(`/artists/${user.id}`, {
        stage_name: stageName,
        bio,
        about_me: aboutMe,
        phone,
        whatsapp,
        website,
        city: city?.nome || "",
        state: city?.uf || "",
        cache_base: parseFloat(cacheBase) || 0,
        genres,
        event_types: eventTypes,
      });
      await refreshUser();
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Dados profissionais
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Nome artístico</Label>
            <Input className="mt-1" value={stageName} onChange={(e) => setStageName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cachê base (R$)</Label>
            <Input className="mt-1" type="number" value={cacheBase} onChange={(e) => setCacheBase(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cidade</Label>
            <CitySearch value={city} onChange={setCity} />
          </div>
          <div>
            <Label className="text-xs">Telefone</Label>
            <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">WhatsApp</Label>
            <Input className="mt-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="text-xs">Website</Label>
          <Input className="mt-1" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <div>
          <Label className="text-xs">Bio curta</Label>
          <Input className="mt-1" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div>
          <Label className="text-xs">Sobre mim</Label>
          <Textarea className="mt-1" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} rows={4} />
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">Gêneros musicais</Label>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <Badge key={g} variant={genres.includes(g) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleGenre(g)}>{g}</Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">Tipos de evento</Label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((e) => (
              <Badge key={e} variant={eventTypes.includes(e) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleEventType(e)}>{e}</Badge>
            ))}
          </div>
        </div>

        <Button className="w-full sm:w-auto" onClick={save} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Salvar alterações
        </Button>
      </div>
    </motion.div>
  );
}

function VenueProfileForm() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [venueData, setVenueData] = useState<Venue | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [infrastructure, setInfrastructure] = useState("");
  const [capacity, setCapacity] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const fetchVenue = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await venuesService.getById(user.id);
        setVenueData(data);
        setName(data.venue_name || "");
        setDescription(data.description || "");
        setInfrastructure(data.infrastructure || "");
        setCapacity(data.capacity?.toString() || "");
        setAddress(data.address || "");
        if (data.city && data.state) {
          setCity({ id: "", nome: data.city, estado: data.state, uf: data.state });
        }
        setPhone(data.phone || "");
        setWhatsapp(data.whatsapp || "");
        setWebsite(data.website || "");
      } catch {
        toast.error("Erro ao carregar dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenue();
  }, [user?.id]);

  const save = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await apiClient.patch(`/venues/${user.id}`, {
        venue_name: name,
        description,
        infrastructure,
        capacity: parseInt(capacity) || 0,
        address,
        city: city?.nome || "",
        state: city?.uf || "",
        phone,
        whatsapp,
        website,
      });
      await refreshUser();
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" /> Dados do local
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Nome do local</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Capacidade</Label>
            <Input className="mt-1" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Cidade</Label>
            <CitySearch value={city} onChange={setCity} />
          </div>
          <div>
            <Label className="text-xs">Telefone</Label>
            <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">WhatsApp</Label>
            <Input className="mt-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Website</Label>
            <Input className="mt-1" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="text-xs">Endereço</Label>
          <Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div>
          <Label className="text-xs">Descrição</Label>
          <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div>
          <Label className="text-xs">Infraestrutura</Label>
          <Textarea className="mt-1" value={infrastructure} onChange={(e) => setInfrastructure(e.target.value)} rows={3} />
        </div>

        <Button className="w-full sm:w-auto" onClick={save} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Salvar alterações
        </Button>
      </div>
    </motion.div>
  );
}

function PhotosManager() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhoto, setMainPhoto] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        if (user.role === "ARTIST") {
          const data = await artistsService.getById(user.id);
          setPhotos(data.photo_urls || []);
        } else {
          const data = await venuesService.getById(user.id);
          setPhotos(data.photo_urls || []);
        }
      } catch {
        toast.error("Erro ao carregar fotos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, [user?.id, user?.role]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || uploading) return;
    const file = files[0];
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Formato não suportado. Use JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const interval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 20, 90));
      }, 200);

      const response = await apiClient.upload<{ file_url: string }>("/upload/photo", formData);

      clearInterval(interval);
      setUploadProgress(100);

      if (response?.file_url) {
        const newPhotos = [...photos, response.file_url];
        
        if (user?.id) {
          try {
            const endpoint = user.role === "ARTIST" ? `/artists/${user.id}` : `/venues/${user.id}`;
            await apiClient.patch(endpoint, { photo_urls: newPhotos });
            setPhotos(newPhotos);
            toast.success("Foto adicionada!");
          } catch {
            toast.error("Erro ao salvar foto no perfil.");
          }
        }
      } else {
        toast.error("Erro: resposta do servidor sem URL.");
      }
    } catch {
      toast.error("Erro ao enviar foto.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removePhoto = async (i: number) => {
    if (!user?.id) return;
    const newPhotos = photos.filter((_, idx) => idx !== i);
    try {
      if (user.role === "ARTIST") {
        await apiClient.patch(`/artists/${user.id}`, { photo_urls: newPhotos });
      } else {
        await apiClient.patch(`/venues/${user.id}`, { photo_urls: newPhotos });
      }
      setPhotos(newPhotos);
      if (mainPhoto === i) setMainPhoto(0);
      else if (mainPhoto > i) setMainPhoto((m) => m - 1);
      toast.success("Foto removida.");
    } catch {
      toast.error("Erro ao remover foto.");
    }
  };

  const setMainPhotoApi = async (i: number) => {
    if (!user?.id) return;
    try {
      if (user.role === "ARTIST") {
        await apiClient.patch(`/artists/${user.id}`, { profile_photo: photos[i] });
      } else {
        await apiClient.patch(`/venues/${user.id}`, { profile_photo: photos[i] });
      }
      setMainPhoto(i);
      await refreshUser();
      toast.success("Foto principal definida!");
    } catch {
      toast.error("Erro ao definir foto principal.");
    }
  };

  if (isLoading) {
    return (
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" /> Fotos
        </h3>

        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => !uploading && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          {uploading ? (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-primary mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
              <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Arraste ou clique para adicionar fotos</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG ou WebP · Máx 5MB</p>
            </>
          )}
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={resolvePhotoUrl(url)}
                  alt={`Foto ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant={mainPhoto === i ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setMainPhotoApi(i)}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {mainPhoto === i ? "Principal" : "Definir"}
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePhoto(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {mainPhoto === i && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary text-primary-foreground text-[10px]">Principal</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PreferencesForm() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        if (user.role === "ARTIST") {
          const data = await artistsService.getById(user.id);
          setEmailNotif(data.email_notifications ?? true);
          setPushNotif(data.push_notifications ?? false);
          setAutoAccept(data.auto_accept ?? false);
          setPublicProfile(data.is_public ?? true);
        } else {
          const data = await venuesService.getById(user.id);
          setEmailNotif(data.email_notifications ?? true);
          setPushNotif(data.push_notifications ?? false);
          setAutoAccept(data.auto_accept ?? false);
          setPublicProfile(data.is_public ?? true);
        }
      } catch {
        toast.error("Erro ao carregar preferências.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [user?.id, user?.role]);

  const save = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const payload = {
        email_notifications: emailNotif,
        push_notifications: pushNotif,
        auto_accept: autoAccept,
        is_public: publicProfile,
      };
      if (user.role === "ARTIST") {
        await apiClient.patch(`/artists/${user.id}`, payload);
      } else {
        await apiClient.patch(`/venues/${user.id}`, payload);
      }
      await refreshUser();
      toast.success("Preferências salvas!");
    } catch {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
      <div className="glass rounded-xl p-5 space-y-5">
        <h3 className="font-heading font-semibold text-foreground">Preferências</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-foreground">Notificações por email</p><p className="text-xs text-muted-foreground">Receber atualizações por email</p></div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-foreground">Notificações push</p><p className="text-xs text-muted-foreground">Receber notificações no navegador</p></div>
            <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-foreground">Aceitar propostas automaticamente</p><p className="text-xs text-muted-foreground">Propostas dentro do seu cachê serão aceitas</p></div>
            <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-foreground">Perfil público</p><p className="text-xs text-muted-foreground">Visível na busca de artistas/contratantes</p></div>
            <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
          </div>
        </div>

        <Button className="w-full sm:w-auto" onClick={save} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Salvar preferências
        </Button>
      </div>
    </motion.div>
  );
}

function AccountInfo() {
  const { user } = useAuth();
  const roleLabel = user?.role === "ARTIST" ? "Artista" : user?.role === "VENUE" ? "Contratante" : "—";

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("ID copiado!");
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
      <div className="glass rounded-xl p-5 space-y-5">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Informações da conta
        </h3>

        <p className="text-xs text-muted-foreground">
          Caso precise de suporte, informe o ID abaixo para agilizar o atendimento.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Tipo</span>
            <span className="text-sm font-medium text-foreground">{roleLabel}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">ID</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-foreground truncate max-w-[220px]">{user?.id || "—"}</span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copyId}>
                Copiar
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Criado em</span>
            <span className="text-sm text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "—"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
