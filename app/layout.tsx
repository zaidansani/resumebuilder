import { Geist_Mono, Figtree } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased h-svh overflow-hidden", fontMono.variable, "font-sans", figtree.variable)}
    >
      <body className="flex flex-col h-svh overflow-hidden w-screen">
        <ThemeProvider>
          <Header />
          <main className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
