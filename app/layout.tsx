import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Space_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ArtistLog - Conectando Artistas e Contratantes",
  description:
    "Plataforma B2B que conecta artistas (DJs, musicos) com contratantes (casas de show, bares, eventos) para criar dobras e otimizar custos.",
}

export const viewport: Viewport = {
  themeColor: "#833DAE",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
