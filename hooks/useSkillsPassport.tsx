"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import type { SkillsPassport } from "@/types/resume"
import {
  SkillsPassportContext,
  type SkillsPassportContextValue,
} from "@/context/SkillsPassportContext"

const STORAGE_KEY = "skills-passport"

function defaultPassport(): SkillsPassport {
  return {
    metadata: {
      lastModified: new Date().toISOString().split("T")[0],
      locale: "en-GB",
    },
    learnerInfo: {
      identification: {
        personName: { firstName: "", surname: "" },
        contact: {},
      },
      workExperience: [],
      education: [],
      skills: { languages: [], other: [] },
      achievements: [],
      publications: [],
      projects: [],
      volunteering: [],
      references: [],
    },
  }
}

function load(): SkillsPassport {
  if (typeof window === "undefined") return defaultPassport()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SkillsPassport) : defaultPassport()
  } catch {
    return defaultPassport()
  }
}

function save(passport: SkillsPassport) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passport))
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

export function SkillsPassportProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [passport, setPassportState] = useState<SkillsPassport>(defaultPassport)

  useEffect(() => {
    setPassportState(load())
  }, [])

  const setPassport = useCallback((next: SkillsPassport) => {
    const stamped: SkillsPassport = {
      ...next,
      metadata: {
        ...next.metadata,
        lastModified: new Date().toISOString().split("T")[0],
      },
    }
    setPassportState(stamped)
    save(stamped)
  }, [])

  const updateLearnerInfo = useCallback(
    (patch: Parameters<SkillsPassportContextValue["updateLearnerInfo"]>[0]) => {
      setPassport({
        ...passport,
        learnerInfo: { ...passport.learnerInfo, ...patch },
      })
    },
    [passport, setPassport]
  )

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(passport, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `skills-passport-${passport.metadata.lastModified}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [passport])

  const reset = useCallback(() => {
    const fresh = defaultPassport()
    setPassportState(fresh)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <SkillsPassportContext.Provider
      value={{ passport, setPassport, updateLearnerInfo, exportJSON, reset }}
    >
      {children}
    </SkillsPassportContext.Provider>
  )
}

export function useSkillsPassport(): SkillsPassportContextValue {
  const ctx = useContext(SkillsPassportContext)
  if (!ctx)
    throw new Error("useSkillsPassport must be used within SkillsPassportProvider")
  return ctx
}
