"use client"

import { useState } from "react"
import { LearnerInfo, Skills, VariantProfile } from "@/types/resume"
import { Button } from "@/components/ui/button"
import {
  IconPlus,
  IconChevronUp,
  IconChevronDown,
  IconChevronRight,
  IconX,
  IconTrash,
} from "@tabler/icons-react"
import IdentificationSection from "./sections/IdentificationSection"
import WorkExperienceSection from "./sections/WorkExperienceSection"
import EducationSection from "./sections/EducationSection"
import SkillsSection from "./sections/SkillsSection"
import ProjectsSection from "./sections/ProjectsSection"
import AchievementsSection from "./sections/AchievementsSection"

export type SectionKey = keyof Omit<LearnerInfo, "identification" | "profiles" | "activeProfileId">

const SECTION_META: Record<SectionKey, { label: string }> = {
  workExperience: { label: "Work Experience" },
  education: { label: "Education" },
  skills: { label: "Skills" },
  achievements: { label: "Achievements" },
  publications: { label: "Publications" },
  projects: { label: "Projects" },
  volunteering: { label: "Volunteering" },
  references: { label: "References" },
  coverLetter: { label: "Cover Letter" },
}

const EMPTY_SKILLS: Skills = { languages: [], other: [] }

export interface TemplateEntry {
  id: string
  label: string
  url: string
}

export interface TemplateManifest {
  global: TemplateEntry[]
  sections: Record<string, TemplateEntry[]>
}

interface Props {
  value: LearnerInfo
  order: SectionKey[]
  onChange: (info: LearnerInfo) => void
  onOrderChange: (order: SectionKey[]) => void
  manifest?: TemplateManifest | null
  sectionTemplateUrls?: Record<string, string>
  onSectionTemplateChange?: (key: string, url: string) => void
  hiddenIds?: Set<string>
  onToggleHidden?: (id: string) => void
  profiles?: VariantProfile[]
  activeProfileId?: string | null
  onProfileSwitch?: (id: string) => void
  onProfileCreate?: () => void
  onProfileDelete?: (id: string) => void
  onProfileRename?: (id: string, label: string) => void
  onProfileAboutChange?: (about: string) => void
}

export default function ResumeBuilder({
  value,
  order,
  onChange,
  onOrderChange,
  manifest,
  sectionTemplateUrls = {},
  onSectionTemplateChange,
  hiddenIds,
  onToggleHidden,
  profiles = [],
  activeProfileId,
  onProfileSwitch,
  onProfileCreate,
  onProfileDelete,
  onProfileRename,
  onProfileAboutChange,
}: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  function update(patch: Partial<LearnerInfo>) {
    onChange({ ...value, ...patch })
  }

  function setOrder(next: SectionKey[]) {
    onOrderChange(next)
  }

  const available = (Object.keys(SECTION_META) as SectionKey[]).filter(
    (k) => !order.includes(k)
  )

  function addSection(key: SectionKey) {
    setOrder([...order, key])
    setAddMenuOpen(false)
  }

  function removeSection(key: SectionKey) {
    setOrder(order.filter((k) => k !== key))
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...order]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setOrder(next)
  }

  function moveDown(index: number) {
    if (index === order.length - 1) return
    const next = [...order]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setOrder(next)
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-6 px-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profiles</span>
          <Button variant="ghost" size="sm" onClick={onProfileCreate} className="h-6 px-2 text-xs">
            <IconPlus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onProfileSwitch?.(p.id)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                p.id === activeProfileId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {activeProfile && (
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <input
                value={activeProfile.label}
                onChange={(e) => onProfileRename?.(activeProfile.id, e.target.value)}
                className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/50"
                placeholder="Profile name"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onProfileDelete?.(activeProfile.id)}
                className="text-destructive hover:text-destructive"
              >
                <IconTrash />
              </Button>
            </div>
            <textarea
              value={activeProfile.about ?? ""}
              onChange={(e) => onProfileAboutChange?.(e.target.value)}
              placeholder={value.identification.about || "About override (leave blank to use default)"}
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/50"
            />
          </div>
        )}
      </div>

      <hr className="border-border" />

      <SectionCard title="Identification" fixed>
        <IdentificationSection
          value={value.identification}
          onChange={(v) => update({ identification: v })}
        />
      </SectionCard>

      {order.map((key, index) => (
        <SectionCard
          key={key}
          title={SECTION_META[key].label}
          onMoveUp={index > 0 ? () => moveUp(index) : undefined}
          onMoveDown={index < order.length - 1 ? () => moveDown(index) : undefined}
          onRemove={() => removeSection(key)}
          templateEntries={manifest?.sections[key]}
          selectedTemplateUrl={sectionTemplateUrls[key]}
          onTemplateChange={(url) => onSectionTemplateChange?.(key, url)}
        >
          {key === "workExperience" && (
            <WorkExperienceSection
              value={value.workExperience}
              onChange={(v) => update({ workExperience: v })}
              hiddenIds={hiddenIds}
              onToggleHidden={onToggleHidden}
            />
          )}
          {key === "education" && (
            <EducationSection
              value={value.education}
              onChange={(v) => update({ education: v })}
              hiddenIds={hiddenIds}
              onToggleHidden={onToggleHidden}
            />
          )}
          {key === "skills" && (
            <SkillsSection
              value={value.skills ?? EMPTY_SKILLS}
              onChange={(v) => update({ skills: v })}
            />
          )}
          {key === "projects" && (
            <ProjectsSection
              value={value.projects}
              onChange={(v) => update({ projects: v })}
              hiddenIds={hiddenIds}
              onToggleHidden={onToggleHidden}
            />
          )}
          {key === "achievements" && (
            <AchievementsSection
              value={value.achievements}
              onChange={(v) => update({ achievements: v })}
              hiddenIds={hiddenIds}
              onToggleHidden={onToggleHidden}
            />
          )}
          {(key === "publications" ||
            key === "volunteering" ||
            key === "references" ||
            key === "coverLetter") && (
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          )}
        </SectionCard>
      ))}

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddMenuOpen((o) => !o)}
          disabled={available.length === 0}
          className="w-full"
        >
          <IconPlus className="mr-1.5 h-3.5 w-3.5" />
          Add section
        </Button>

        {addMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
            {available.map((key) => (
              <button
                key={key}
                onClick={() => addSection(key)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
              >
                {SECTION_META[key].label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface SectionCardProps {
  title: string
  children: React.ReactNode
  fixed?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: () => void
  templateEntries?: TemplateEntry[]
  selectedTemplateUrl?: string
  onTemplateChange?: (url: string) => void
}

function SectionCard({
  title,
  children,
  fixed,
  onMoveUp,
  onMoveDown,
  onRemove,
  templateEntries,
  selectedTemplateUrl,
  onTemplateChange,
}: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex flex-1 items-center gap-1.5 text-left min-w-0"
        >
          {collapsed
            ? <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            : <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </button>

        {templateEntries && templateEntries.length >= 1 && (
          <select
            value={selectedTemplateUrl ?? ""}
            onChange={(e) => onTemplateChange?.(e.target.value)}
            className="h-6 rounded border border-border bg-background px-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/50"
          >
            {templateEntries.map((t) => (
              <option key={t.id} value={t.url}>{t.label}</option>
            ))}
          </select>
        )}

        {!fixed && (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-xs" onClick={onMoveUp} disabled={!onMoveUp}>
              <IconChevronUp />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onMoveDown} disabled={!onMoveDown}>
              <IconChevronDown />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <IconX />
            </Button>
          </div>
        )}
      </div>

      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  )
}
