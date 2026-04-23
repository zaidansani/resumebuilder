"use client"

import { Button } from "@/components/ui/button"
import { IconMoon, IconPlus, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        <span className="text-xl font-bold tracking-tight">Resume Builder</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.dispatchEvent(new Event("resume-builder:new"))
            }
            className="gap-1.5 text-xs"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Start fresh
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle dark mode"
          >
            {mounted && resolvedTheme === "dark" ? (
              <IconSun className="h-4 w-4" />
            ) : (
              <IconMoon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
