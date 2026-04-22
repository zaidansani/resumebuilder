"use client"

import TypstPreview from "@/components/typst/TypstPreview"
import { Button } from "@/components/ui/button"
import { LearnerInfo, VariantProfile } from "@/types/resume"
import { learnerToData } from "@/utils/learnerToData"
import { compileWithTemplate, compileWithTemplatePdf, downloadBlob, TemplateConfig } from "@/utils/typst"
import { IconPlayerPlay } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import ResumeBuilder, { SectionKey } from "./ResumeBuilder"

interface TemplateEntry {
  id: string
  label: string
  url: string
  sectionDefaults?: Record<string, string>
}

interface TemplateManifest {
  global: TemplateEntry[]
  sections: Record<string, TemplateEntry[]>
}

const EMPTY_LEARNER: LearnerInfo = {
  identification: { personName: { firstName: "", surname: "" }, contact: {} },
  workExperience: [],
  education: [],
  skills: { languages: [], other: [] },
  achievements: [],
  publications: [],
  projects: [],
  volunteering: [],
  references: [],
}

function loadDraft(): { learner: LearnerInfo; order: SectionKey[] } {
  try {
    const raw = localStorage.getItem("resume-builder:draft")
    if (raw) {
      const { learner, order } = JSON.parse(raw)
      return {
        learner: learner ?? EMPTY_LEARNER,
        order: order ?? [],
      }
    }
  } catch {}
  return { learner: EMPTY_LEARNER, order: [] }
}

export default function EditorLayout() {
  const [artifact, setArtifact] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)

  const defaultProfileId = useRef(crypto.randomUUID())
  const [profiles, setProfiles] = useState<VariantProfile[]>([
    { id: defaultProfileId.current, label: "Default", hidden: [], variantSelections: {} },
  ])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(defaultProfileId.current)
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null
  const hiddenIds = new Set(activeProfile?.hidden ?? [])

  function createProfile() {
    const id = crypto.randomUUID()
    const profile: VariantProfile = { id, label: `Profile ${profiles.length + 1}`, hidden: [], variantSelections: {} }
    setProfiles([...profiles, profile])
    setActiveProfileId(id)
  }

  function deleteProfile(id: string) {
    const next = profiles.filter((p) => p.id !== id)
    setProfiles(next)
    if (activeProfileId === id) setActiveProfileId(next[next.length - 1]?.id ?? null)
  }

  function renameProfile(id: string, label: string) {
    setProfiles(profiles.map((p) => p.id === id ? { ...p, label } : p))
  }

  function updateProfileAbout(about: string) {
    if (!activeProfile) return
    setProfiles(profiles.map((p) => p.id === activeProfile.id ? { ...p, about: about || undefined } : p))
  }

  function toggleHidden(entryId: string) {
    if (!activeProfile) return
    const next = activeProfile.hidden.includes(entryId)
      ? activeProfile.hidden.filter((h) => h !== entryId)
      : [...activeProfile.hidden, entryId]
    setProfiles(profiles.map((p) => p.id === activeProfile.id ? { ...p, hidden: next } : p))
  }

  const [manifest, setManifest] = useState<TemplateManifest | null>(null)
  const [globalTemplateUrl, setGlobalTemplateUrl] = useState<string>(
    "/typst/templates/global/default.typ"
  )
  const [sectionTemplateUrls, setSectionTemplateUrls] = useState<Record<string, string>>({
    workExperience: "/typst/templates/sections/workExperience/default.typ",
    education: "/typst/templates/sections/education/default.typ",
    skills: "/typst/templates/sections/skills/default.typ",
    projects: "/typst/templates/sections/projects/default.typ",
    achievements: "/typst/templates/sections/achievements/default.typ",
  })

  const draft = loadDraft()
  const [learner, setLearner] = useState<LearnerInfo>(draft.learner)
  const [order, setOrder] = useState<SectionKey[]>(draft.order)
  const effectiveOrder: SectionKey[] = (activeProfile?.sectionOrder as SectionKey[] | undefined) ?? order

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const compileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function scheduleSave(nextLearner: LearnerInfo, nextOrder: SectionKey[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "resume-builder:draft",
          JSON.stringify({ learner: nextLearner, order: nextOrder })
        )
      } catch {}
    }, 500)
  }

  function scheduleCompile() {
    if (compileTimer.current) clearTimeout(compileTimer.current)
    compileTimer.current = setTimeout(() => compile(), 1500)
  }

  function handleLearnerChange(next: LearnerInfo) {
    setLearner(next)
    scheduleSave(next, order)
    scheduleCompile()
  }

  function handleOrderChange(next: SectionKey[]) {
    if (activeProfile) {
      setProfiles(profiles.map((p) => p.id === activeProfile.id ? { ...p, sectionOrder: next } : p))
    } else {
      setOrder(next)
      scheduleSave(learner, next)
    }
    scheduleCompile()
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/typst/templates/manifest.json`)
      .then((r) => r.json())
      .then((m: TemplateManifest) => {
        setManifest(m)
        if (m.global[0]) setGlobalTemplateUrl(m.global[0].url)
        const defaults: Record<string, string> = {}
        for (const [key, entries] of Object.entries(m.sections)) {
          if (entries[0]) defaults[key] = entries[0].url
        }
        setSectionTemplateUrls(defaults)
      })
      .catch(() => {/* manifest not yet generated — dev without prebuild */})
  }, [])

  // Auto-compile on load if there's saved data
  useEffect(() => {
    if (learner !== EMPTY_LEARNER && globalTemplateUrl) compile()
  }, [globalTemplateUrl])

  const resolvedSectionManifest: Record<string, TemplateEntry[]> = {}
  for (const [key, fallbackUrl] of Object.entries(sectionTemplateUrls)) {
    const id = fallbackUrl.split("/").pop()?.replace(".typ", "") ?? "default"
    const fallback: TemplateEntry = { id, label: id.charAt(0).toUpperCase() + id.slice(1), url: fallbackUrl }
    resolvedSectionManifest[key] = manifest?.sections[key] ?? [fallback]
  }

  const learnerRef = useRef(learner)
  const orderRef = useRef(effectiveOrder)
  learnerRef.current = learner
  orderRef.current = effectiveOrder

  const activeProfileRef = useRef(activeProfile)
  activeProfileRef.current = activeProfile

  async function compile() {
    if (!globalTemplateUrl) return
    setRendering(true)
    setError(null)
    try {
      const data = learnerToData(learnerRef.current, orderRef.current, activeProfileRef.current ?? undefined)
      const config: TemplateConfig = {
        globalUrl: globalTemplateUrl,
        sections: orderRef.current
          .filter((key) => sectionTemplateUrls[key])
          .map((key) => ({ key, url: sectionTemplateUrls[key] })),
      }
      setArtifact(await compileWithTemplate(data, config))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRendering(false)
    }
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem-3rem)] divide-x divide-border">
      <div className="flex w-1/2 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2 h-[41px]">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            Resume
          </span>

          <div className="flex flex-row items-center gap-2">
            {manifest && manifest.global.length >= 1 && (
              <select
                value={globalTemplateUrl}
                onChange={(e) => {
                  const url = e.target.value
                  setGlobalTemplateUrl(url)
                  const entry = manifest.global.find((t) => t.url === url)
                  if (entry?.sectionDefaults) {
                    setSectionTemplateUrls((prev) => ({ ...prev, ...entry.sectionDefaults }))
                  }
                }}
                className="ml-auto h-7 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/50"
              >
                {manifest.global.map((t) => (
                  <option key={t.id} value={t.url}>{t.label}</option>
                ))}
              </select>
            )}

            <Button
              size="sm"
              onClick={compile}
              disabled={rendering}
              className="ml-auto shrink-0"
            >
              <IconPlayerPlay className="mr-1.5 h-3.5 w-3.5" />
              {rendering ? "Compiling…" : "Render"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ResumeBuilder
            value={learner}
            order={effectiveOrder}
            onChange={handleLearnerChange}
            onOrderChange={handleOrderChange}
            manifest={{ global: manifest?.global ?? [], sections: resolvedSectionManifest }}
            sectionTemplateUrls={sectionTemplateUrls}
            onSectionTemplateChange={(key, url) =>
              setSectionTemplateUrls((prev) => ({ ...prev, [key]: url }))
            }
            hiddenIds={activeProfile ? hiddenIds : undefined}
            onToggleHidden={activeProfile ? toggleHidden : undefined}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onProfileSwitch={setActiveProfileId}
            onProfileCreate={createProfile}
            onProfileDelete={deleteProfile}
            onProfileRename={renameProfile}
            onProfileAboutChange={updateProfileAbout}
          />
        </div>
      </div>

      <TypstPreview
        artifact={artifact}
        error={error}
        onExportPdf={async () => {
          if (!globalTemplateUrl) return
          const data = learnerToData(learnerRef.current, orderRef.current, activeProfileRef.current ?? undefined)
          const config: TemplateConfig = {
            globalUrl: globalTemplateUrl,
            sections: orderRef.current
              .filter((key) => sectionTemplateUrls[key])
              .map((key) => ({ key, url: sectionTemplateUrls[key] })),
          }
          const pdf = await compileWithTemplatePdf(data, config)
          downloadBlob(pdf, "resume.pdf", "application/pdf")
        }}
      />
    </div>
  )
}
