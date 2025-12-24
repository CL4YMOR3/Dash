import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Roboto } from "next/font/google"
import "./globals.css"
import { MusicProvider } from "@/lib/music-context"
import { ThemeProvider } from "@/lib/theme-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { validateConfig } from "@/lib/config"

// Validate environment variables during server initialization
validateConfig()

// Font for headings
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

// Font for body text
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["300", "400", "500", "700"],
})

export const metadata: Metadata = {
  title: "DASH Dashboard",
  description: "Modern, touch and voice-responsive dashboard for DASH",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${roboto.variable} font-body`}>
        <ErrorBoundary>
          <ThemeProvider>
            <MusicProvider>{children}</MusicProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
