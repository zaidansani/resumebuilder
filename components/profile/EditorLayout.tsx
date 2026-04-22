"use client"

import TypstPreview from "@/components/typst/TypstPreview"
import { Button } from "@/components/ui/button"
import { LearnerInfo, VariantProfile } from "@/types/resume"
import { learnerToData } from "@/utils/learnerToData"
import {
  compileWithTemplate,
  compileWithTemplatePdf,
  downloadBlob,
  TemplateConfig,
} from "@/utils/typst"
import { IconDownload, IconLayoutColumns, IconLayoutRows, IconPlayerPlay, IconUpload } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import OnboardingModal from "./OnboardingModal"
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

function loadDraft(): {
  learner: LearnerInfo
  order: SectionKey[]
  profiles?: VariantProfile[]
  activeProfileId?: string | null
} {
  try {
    const raw = localStorage.getItem("resume-builder:draft")
    if (raw) {
      const { learner, order, profiles, activeProfileId } = JSON.parse(raw)
      return {
        learner: learner ?? EMPTY_LEARNER,
        order: order ?? [],
        profiles,
        activeProfileId,
      }
    }
  } catch {}
  return { learner: EMPTY_LEARNER, order: [] }
}

export default function EditorLayout() {
  const [stackedOverride, setStackedOverride] = useState<boolean | null>(null)
  const [autoStacked, setAutoStacked] = useState(false)
  const stacked = stackedOverride ?? autoStacked
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")

  useEffect(() => {
    function check() {
      setAutoStacked(window.innerWidth / window.innerHeight < 1.2)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const [artifact, setArtifact] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)

  const defaultProfileId = useRef(crypto.randomUUID())
  const [profiles, setProfiles] = useState<VariantProfile[]>(() => {
    const d = loadDraft()
    return (
      d.profiles ?? [
        {
          id: defaultProfileId.current,
          label: "Default",
          hidden: [],
          variantSelections: {},
        },
      ]
    )
  })
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    const d = loadDraft()
    return d.activeProfileId ?? defaultProfileId.current
  })
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null
  const hiddenIds = new Set(activeProfile?.hidden ?? [])

  function createProfile() {
    const id = crypto.randomUUID()
    const profile: VariantProfile = {
      id,
      label: `Profile ${profiles.length + 1}`,
      hidden: [],
      variantSelections: {},
    }
    setProfiles([...profiles, profile])
    setActiveProfileId(id)
  }

  function deleteProfile(id: string) {
    const next = profiles.filter((p) => p.id !== id)
    setProfiles(next)
    if (activeProfileId === id)
      setActiveProfileId(next[next.length - 1]?.id ?? null)
  }

  function renameProfile(id: string, label: string) {
    setProfiles(profiles.map((p) => (p.id === id ? { ...p, label } : p)))
  }

  function updateProfileAbout(about: string) {
    if (!activeProfile) return
    setProfiles(
      profiles.map((p) =>
        p.id === activeProfile.id ? { ...p, about: about || undefined } : p
      )
    )
  }

  function toggleHidden(entryId: string) {
    if (!activeProfile) return
    const next = activeProfile.hidden.includes(entryId)
      ? activeProfile.hidden.filter((h) => h !== entryId)
      : [...activeProfile.hidden, entryId]
    setProfiles(
      profiles.map((p) =>
        p.id === activeProfile.id ? { ...p, hidden: next } : p
      )
    )
  }

  const [manifest, setManifest] = useState<TemplateManifest | null>(null)
  const [globalTemplateUrl, setGlobalTemplateUrl] = useState<string>(
    "/typst/templates/global/default.typ"
  )
  const [sectionTemplateUrls, setSectionTemplateUrls] = useState<
    Record<string, string>
  >({
    workExperience: "/typst/templates/sections/workExperience/default.typ",
    education: "/typst/templates/sections/education/default.typ",
    skills: "/typst/templates/sections/skills/default.typ",
    projects: "/typst/templates/sections/projects/default.typ",
    achievements: "/typst/templates/sections/achievements/default.typ",
  })

  const [learner, setLearner] = useState<LearnerInfo>(() => loadDraft().learner)
  const [order, setOrder] = useState<SectionKey[]>(() => loadDraft().order)

  function isDraftEmpty(l: LearnerInfo) {
    return (
      !l.identification.personName.firstName &&
      !l.identification.personName.surname &&
      l.workExperience.length === 0 &&
      l.education.length === 0
    )
  }

  const [showOnboarding, setShowOnboarding] = useState(() => isDraftEmpty(loadDraft().learner))

  useEffect(() => {
    function onNew() { setShowOnboarding(true) }
    window.addEventListener("resume-builder:new", onNew)
    return () => window.removeEventListener("resume-builder:new", onNew)
  }, [])

  function getFilledSections(learner: LearnerInfo): SectionKey[] {
    const sections: SectionKey[] = []
    if (learner.workExperience.length > 0) sections.push("workExperience")
    if (learner.education.length > 0) sections.push("education")
    if (learner.skills.languages.length > 0 || learner.skills.other.length > 0)
      sections.push("skills")
    if (learner.projects.length > 0) sections.push("projects")
    if (learner.achievements.length > 0) sections.push("achievements")
    if (learner.publications.length > 0) sections.push("publications")
    if (learner.volunteering.length > 0) sections.push("volunteering")
    if (learner.references.length > 0) sections.push("references")
    if (learner.coverLetter) sections.push("coverLetter")
    return sections
  }

  function handleStartFresh(firstName: string, surname: string) {
    const fresh: LearnerInfo = {
      ...EMPTY_LEARNER,
      identification: {
        personName: { firstName, surname },
        contact: {},
      },
    }
    setLearner(fresh)
    setOrder([])
    setShowOnboarding(false)
  }

  function handleLinkedInImport(partial: Partial<LearnerInfo>) {
    const imported = { ...EMPTY_LEARNER, ...partial }
    setLearner(imported)
    setOrder(getFilledSections(imported))
    setShowOnboarding(false)
  }

  function handleJsonImport(data: {
    learner: LearnerInfo
    order?: string[]
    profiles?: VariantProfile[]
    activeProfileId?: string | null
  }) {
    if (data.learner) setLearner(data.learner)
    if (data.order) setOrder(data.order as SectionKey[])
    if (data.profiles) setProfiles(data.profiles)
    if (data.activeProfileId !== undefined) setActiveProfileId(data.activeProfileId)
    setShowOnboarding(false)
  }
  const effectiveOrder: SectionKey[] =
    (activeProfile?.sectionOrder as SectionKey[] | undefined) ?? order

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const compileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "resume-builder:draft",
          JSON.stringify({ learner, order, profiles, activeProfileId })
        )
      } catch {}
    }, 500)
  }, [learner, order, profiles, activeProfileId])

  useEffect(() => {
    if (compileTimer.current) clearTimeout(compileTimer.current)
    compileTimer.current = setTimeout(() => compile(), 1500)
  }, [learner, profiles, activeProfileId, sectionTemplateUrls])

  function handleLearnerChange(next: LearnerInfo) {
    setLearner(next)
  }

  function handleOrderChange(next: SectionKey[]) {
    setOrder(next)
    if (activeProfile) {
      setProfiles(
        profiles.map((p) =>
          p.id === activeProfile.id ? { ...p, sectionOrder: next } : p
        )
      )
    }
  }

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/typst/templates/manifest.json`
    )
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
      .catch(() => {
        /* manifest not yet generated — dev without prebuild */
      })
  }, [])

  const resolvedSectionManifest: Record<string, TemplateEntry[]> = {}
  for (const [key, fallbackUrl] of Object.entries(sectionTemplateUrls)) {
    const id = fallbackUrl.split("/").pop()?.replace(".typ", "") ?? "default"
    const fallback: TemplateEntry = {
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      url: fallbackUrl,
    }
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
      const data = learnerToData(
        learnerRef.current,
        orderRef.current,
        activeProfileRef.current ?? undefined
      )
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

  function exportJson() {
    const data = JSON.stringify(
      { learner, order, profiles, activeProfileId },
      null,
      2
    )
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJsonRef = useRef<HTMLInputElement>(null)

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed.learner) setLearner(parsed.learner)
        if (parsed.order) setOrder(parsed.order)
        if (parsed.profiles) setProfiles(parsed.profiles)
        if (parsed.activeProfileId !== undefined)
          setActiveProfileId(parsed.activeProfileId)
      } catch {
        alert("Invalid JSON file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const exportPdf = async () => {
    if (!globalTemplateUrl) return
    const data = learnerToData(
      learnerRef.current,
      orderRef.current,
      activeProfileRef.current ?? undefined
    )
    const config: TemplateConfig = {
      globalUrl: globalTemplateUrl,
      sections: orderRef.current
        .filter((key) => sectionTemplateUrls[key])
        .map((key) => ({ key, url: sectionTemplateUrls[key] })),
    }
    const pdf = await compileWithTemplatePdf(data, config)
    downloadBlob(pdf, "resume.pdf", "application/pdf")
  }

  const editorToolbar = (
    <div className="flex h-[41px] shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2">
      {stacked ? (
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("editor")}
            className={`rounded px-2 py-1 text-xs font-medium ${activeTab === "editor" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded px-2 py-1 text-xs font-medium ${activeTab === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Preview
          </button>
        </div>
      ) : (
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          Resume
        </span>
      )}

      <div className="flex flex-row items-center gap-2">
        {manifest && manifest.global.length >= 1 && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Template:
            <select
              value={globalTemplateUrl}
              onChange={(e) => {
                const url = e.target.value
                setGlobalTemplateUrl(url)
                const entry = manifest.global.find((t) => t.url === url)
                if (entry?.sectionDefaults) {
                  setSectionTemplateUrls((prev) => ({
                    ...prev,
                    ...entry.sectionDefaults,
                  }))
                }
              }}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/50"
            >
              {manifest.global.map((t) => (
                <option key={t.id} value={t.url}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={exportJson}
          className="shrink-0"
          title="Export JSON"
        >
          <IconDownload className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>

        <label title="Import JSON" className="shrink-0 cursor-pointer">
          <Button size="sm" variant="ghost" asChild>
            <span>
              <IconUpload className="mr-1.5 h-3.5 w-3.5" />
              Import
            </span>
          </Button>
          <input
            ref={importJsonRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportJson}
          />
        </label>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setStackedOverride(!stacked)}
          className="shrink-0"
          title={stacked ? "Side by side" : "Stack panels"}
        >
          {stacked ? <IconLayoutColumns className="h-3.5 w-3.5" /> : <IconLayoutRows className="h-3.5 w-3.5" />}
        </Button>

        <Button
          size="sm"
          onClick={compile}
          disabled={rendering}
          className="shrink-0"
        >
          <IconPlayerPlay className="mr-1.5 h-3.5 w-3.5" />
          {rendering ? "Compiling…" : "Render"}
        </Button>
      </div>
    </div>
  )

  const onboardingModal = showOnboarding && (
    <OnboardingModal
      onStartFresh={handleStartFresh}
      onLinkedIn={handleLinkedInImport}
      onImportJson={handleJsonImport}
      onClose={() => setShowOnboarding(false)}
    />
  )

  if (stacked) {
    return (
      <div className="flex h-[calc(100svh-3.5rem-3rem)] flex-col">
        {onboardingModal}
        {editorToolbar}
        <div className="flex-1 overflow-hidden">
          {activeTab === "editor" ? (
            <div className="h-full overflow-y-auto">
              <ResumeBuilder
                value={learner}
                order={effectiveOrder}
                onChange={handleLearnerChange}
                onOrderChange={handleOrderChange}
                manifest={{
                  global: manifest?.global ?? [],
                  sections: resolvedSectionManifest,
                }}
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
          ) : (
            <TypstPreview
              artifact={artifact}
              error={error}
              onExportPdf={exportPdf}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem-3rem)] divide-x divide-border">
      {onboardingModal}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {editorToolbar}
        <div className="flex-1 overflow-y-auto">
          <ResumeBuilder
            value={learner}
            order={effectiveOrder}
            onChange={handleLearnerChange}
            onOrderChange={handleOrderChange}
            manifest={{
              global: manifest?.global ?? [],
              sections: resolvedSectionManifest,
            }}
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

      <div className="w-1/2 min-w-0">
        <TypstPreview artifact={artifact} error={error} onExportPdf={exportPdf} />
      </div>
    </div>
  )
}
