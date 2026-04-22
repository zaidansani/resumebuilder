"use client"

import ContentBlockVariantEditor from "@/components/profile/sections/ContentBlockVariantEditor"
import { Button } from "@/components/ui/button"
import { Project } from "@/types/resume"
import { IconPlus, IconX } from "@tabler/icons-react"
import { useState } from "react"
import Field from "./Field"
import { useListSection } from "./hooks/useListSection"
import SectionListItem from "./SectionListItem"

interface Props {
  value: Project[]
  onChange: (value: Project[]) => void
  hiddenIds?: Set<string>
  onToggleHidden?: (id: string) => void
}

function newProject(): Project {
  const variantId = crypto.randomUUID()
  return {
    id: crypto.randomUUID(),
    title: "",
    variants: [{ id: variantId, label: "Default", content: [] }],
    activeVariantId: variantId,
  }
}

export default function ProjectsSection({ value, onChange, hiddenIds, onToggleHidden }: Props) {
  const { expanded, toggle, add, remove, update, updateBlocks, addVariant, deleteVariant, renameVariant, moveUp, moveDown } =
    useListSection(value, onChange)

  return (
    <div className="space-y-2">
      {value.map((project, index) => {
        const title = [project.title, project.role].filter(Boolean).join(" · ") || "Untitled"
        return (
          <SectionListItem
            key={project.id}
            id={project.id}
            title={title}
            isExpanded={expanded.has(project.id)}
            onToggle={() => toggle(project.id)}
            onRemove={() => remove(project.id)}
            onMoveUp={index > 0 ? () => moveUp(project.id) : undefined}
            onMoveDown={index < value.length - 1 ? () => moveDown(project.id) : undefined}
            hiddenIds={hiddenIds}
            onToggleHidden={onToggleHidden}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" value={project.title} onChange={(v) => update(project.id, { title: v })} />
              <Field label="Role" value={project.role ?? ""} onChange={(v) => update(project.id, { role: v || undefined })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="URL" value={project.url ?? ""} onChange={(v) => update(project.id, { url: v || undefined })} type="url" />
              <Field label="Repo URL" value={project.repoUrl ?? ""} onChange={(v) => update(project.id, { repoUrl: v || undefined })} type="url" />
            </div>

            <TechField
              value={project.technologies ?? []}
              onChange={(v: string[]) => update(project.id, { technologies: v.length ? v : undefined })}
            />

            <ContentBlockVariantEditor
              variants={project.variants}
              activeVariantId={project.activeVariantId}
              allowedTypes={["bullets", "paragraph"]}
              onBlocksChange={(blocks) => updateBlocks(project.id, blocks)}
              onVariantSwitch={(vid) => update(project.id, { activeVariantId: vid })}
              onVariantAdd={() => addVariant(project.id)}
              onVariantDelete={(vid) => deleteVariant(project.id, vid)}
              onVariantRename={(vid, label) => renameVariant(project.id, vid, label)}
            />
          </SectionListItem>
        )
      })}

      <Button variant="outline" size="sm" onClick={() => add(newProject())} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add project
      </Button>
    </div>
  )
}

function TechField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("")

  function commit() {
    const trimmed = input.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setInput("")
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">Technologies</span>
      <div className="flex flex-wrap gap-1.5">
        {value.map((t, i) => (
          <span key={i} className="flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs">
            {t}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
              <IconX className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit() } }}
          onBlur={commit}
          placeholder="Add technology…"
          className="h-6 min-w-24 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )
}
