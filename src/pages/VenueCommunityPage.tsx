import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { InternalHeader } from "@/components/InternalHeader";
import { VenueCard } from "@/components/VenueCard";
import { CitySearch } from "@/components/CitySearch";
import { MapCoordinatePicker } from "@/components/MapCoordinatePicker";
import { BRAZIL_STATES } from "@/lib/brazil-states";
import { venuesService } from "@/services/venues-service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Globe, Plus, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function VenueCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: communityVenues = [] } = useQuery({
    queryKey: ["venues", "community"],
    queryFn: () => venuesService.getCommunityVenues({ limit: 200, offset: 0 }),
  });

  const createMutation = useMutation({
    mutationFn: venuesService.createCommunityVenue,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["venues", "community"] });
      toast.success("Local adicionado com sucesso!");
      navigate(`/venues/${response.id}`);
    },
    onError: () => {
      toast.error("Nao foi possivel adicionar o local.");
    },
  });

  const filteredCommunity = communityVenues.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.venue_name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q);
  });

  // Submit form state
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLatitude, setFormLatitude] = useState<number | null>(null);
  const [formLongitude, setFormLongitude] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCity || !formState) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    if (formLatitude === null || formLongitude === null) {
      toast.error("Use a localizacao para preencher latitude e longitude.");
      return;
    }

    createMutation.mutate({
      venue_name: formName,
      description: formDescription,
      infrastructure: formAddress,
      capacity: Number(formCapacity || 0),
      city: formCity,
      state: formState,
      latitude: formLatitude,
      longitude: formLongitude,
      is_anonymous: false,
    });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLatitude(pos.coords.latitude);
        setFormLongitude(pos.coords.longitude);
        toast.success(`Localizacao obtida: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => toast.error("Não foi possível obter sua localização.")
    );
  };

  return (
    <>
      <InternalHeader title="Comunidade" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Locais da Comunidade</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore e adicione locais públicos ou espaços ainda não cadastrados na plataforma.
              </p>
            </div>
          </motion.div>

          <Tabs defaultValue="explore">
            <TabsList className="glass">
              <TabsTrigger value="explore">Explorar</TabsTrigger>
              <TabsTrigger value="submit">Adicionar local</TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="space-y-4 mt-4">
              <div className="glass rounded-xl p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar local comunitário..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-transparent border-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              {filteredCommunity.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCommunity.map((v, i) => (
                    <motion.div key={v.id} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
                      <VenueCard venue={v} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-12 text-center">
                  <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">Nenhum local encontrado</h3>
                  <p className="text-sm text-muted-foreground">Que tal adicionar um?</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submit" className="mt-4">
              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
                <form onSubmit={handleSubmit} className="glass rounded-xl p-5 space-y-4">
                  <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Adicionar novo local
                  </h3>

                  <div>
                    <Label className="text-xs">Nome do local *</Label>
                    <Input className="mt-1" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Praça da Liberdade" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <CitySearch
                        compact
                        label="Cidade"
                        value={formCity}
                        onCitySelect={(city) => {
                          setFormCity(city.name);
                          setFormState(city.state);
                          setFormLatitude(city.latitude);
                          setFormLongitude(city.longitude);
                        }}
                        placeholder="Digite para buscar..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Estado *</Label>
                      <Select value={formState} onValueChange={setFormState}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {BRAZIL_STATES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Endereço</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Rua, número, bairro" className="flex-1" />
                      <Button type="button" variant="outline" size="icon" onClick={handleUseLocation} title="Usar minha localização">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Mapa (OpenStreetMap)</Label>
                    <MapCoordinatePicker
                      latitude={formLatitude}
                      longitude={formLongitude}
                      onPick={(lat, lng) => {
                        setFormLatitude(lat);
                        setFormLongitude(lng);
                      }}
                      className="h-64"
                    />
                    <p className="text-xs text-muted-foreground">
                      Clique no mapa para marcar a coordenada exata ou use o botao de localizacao.
                    </p>
                    {formLatitude !== null && formLongitude !== null && (
                      <p className="text-xs text-muted-foreground">
                        Coordenadas selecionadas: <strong>{formLatitude.toFixed(6)}, {formLongitude.toFixed(6)}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Capacidade estimada</Label>
                    <Input className="mt-1" type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} placeholder="500" />
                  </div>

                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Textarea className="mt-1" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Descreva o local..." rows={3} />
                  </div>

                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Enviando..." : "Adicionar local"}
                  </Button>
                </form>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
