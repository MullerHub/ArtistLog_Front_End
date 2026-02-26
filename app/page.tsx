import Link from "next/link"
import { Music, Mic, Building2, ArrowRight, Zap, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ArtistLog</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Criar Conta</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Plataforma B2B para musica ao vivo
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Conectando artistas e contratantes de forma inteligente
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Crie dobras, otimize custos de transporte e encontre os melhores artistas e contratantes da sua regiao.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Comecar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/artists">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                Explorar artistas
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-muted/50 px-6 py-16 md:py-24">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-xl bg-primary/10 p-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Para Artistas</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Crie seu perfil profissional, gerencie sua agenda e encontre contratantes interessados no seu trabalho.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-xl bg-secondary/20 p-4">
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Para Contratantes</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Busque artistas disponiveis, filtre por genero e localizacao, e avalie apos o show.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-xl bg-accent/20 p-4">
                <MapPin className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Dobras</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Agrupe shows na mesma regiao para dividir custos de transporte e hospedagem.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        ArtistLog - Conectando artistas e contratantes
      </footer>
    </div>
  )
}
