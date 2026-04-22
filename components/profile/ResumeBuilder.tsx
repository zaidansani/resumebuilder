"use client"

import { Button } from "@/components/ui/button"
import { LearnerInfo, Skills, VariantProfile } from "@/types/resume"
import {
  IconBook,
  IconBriefcase,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCode,
  IconFileText,
  IconHeart,
  IconLayoutGrid,
  IconPlus,
  IconSchool,
  IconTrash,
  IconTrophy,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react"
import { useState } from "react"
import AchievementsSection from "./sections/AchievementsSection"
import EducationSection from "./sections/EducationSection"
import IdentificationSection from "./sections/IdentificationSection"
import ProjectsSection from "./sections/ProjectsSection"
import SkillsSection from "./sections/SkillsSection"
import WorkExperienceSection from "./sections/WorkExperienceSection"

export type SectionKey = keyof Omit<
  LearnerInfo,
  "identification" | "profiles" | "activeProfileId"
>

const SECTION_META: Record<
  SectionKey,
  { label: string; icon: React.ElementType }
> = {
  workExperience: { label: "Work Experience", icon: IconBriefcase },
  education: { label: "Education", icon: IconSchool },
  skills: { label: "Skills", icon: IconCode },
  achievements: { label: "Achievements", icon: IconTrophy },
  publications: { label: "Publications", icon: IconBook },
  projects: { label: "Projects", icon: IconLayoutGrid },
  volunteering: { label: "Volunteering", icon: IconHeart },
  references: { label: "References", icon: IconUsers },
  coverLetter: { label: "Cover Letter", icon: IconFileText },
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
    <div className="mx-auto w-9/10 space-y-4 px-6 py-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Profiles
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileCreate}
            className="h-6 px-2 text-xs"
          >
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
                onChange={(e) =>
                  onProfileRename?.(activeProfile.id, e.target.value)
                }
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
              placeholder={
                value.identification.about ||
                "About override (leave blank to use default)"
              }
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring/50"
            />
          </div>
        )}
      </div>

      <hr className="border-border" />

      <SectionCard title="Identification" icon={IconUser} fixed>
        <IdentificationSection
          value={value.identification}
          onChange={(v) => update({ identification: v })}
        />
      </SectionCard>

      {order.map((key, index) => (
        <SectionCard
          key={key}
          title={SECTION_META[key].label}
          icon={SECTION_META[key].icon}
          onMoveUp={index > 0 ? () => moveUp(index) : undefined}
          onMoveDown={
            index < order.length - 1 ? () => moveDown(index) : undefined
          }
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

      {available.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Add section
          </span>
          <div className="grid grid-cols-3 gap-2">
            {available.map((key) => {
              const Icon = SECTION_META[key].icon
              return (
                <button
                  key={key}
                  onClick={() => addSection(key)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {SECTION_META[key].label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface SectionCardProps {
  title: string
  icon?: React.ElementType
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
  icon: Icon,
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
      <div className="flex w-full items-center gap-2 border-b border-border px-4 py-2.5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          {collapsed ? (
            <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          {Icon && (
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </button>

        {templateEntries && templateEntries.length >= 1 && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Template:
            <select
              value={selectedTemplateUrl ?? ""}
              onChange={(e) => onTemplateChange?.(e.target.value)}
              className="h-6 rounded border border-border bg-background px-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/50"
            >
              {templateEntries.map((t) => (
                <option key={t.id} value={t.url}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {!fixed && (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onMoveUp}
              disabled={!onMoveUp}
            >
              <IconChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onMoveDown}
              disabled={!onMoveDown}
            >
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

      {!collapsed && <div className="w-full p-4">{children}</div>}
    </div>
  )
}
