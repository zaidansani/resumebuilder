"use client"

import ContentBlockVariantEditor from "@/components/profile/sections/ContentBlockVariantEditor"
import { Button } from "@/components/ui/button"
import { ContentBlock, ContentVariant, Project } from "@/types/resume"
import { IconChevronDown, IconChevronRight, IconEye, IconEyeOff, IconPlus, IconTrash, IconX } from "@tabler/icons-react"
import { useState } from "react"

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((s) => { const n = new Set(s); s.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function add() {
    onChange([...value, newProject()])
  }

  function remove(id: string) {
    onChange(value.filter((p) => p.id !== id))
  }

  function update(id: string, patch: Partial<Project>) {
    onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function updateBlocks(id: string, blocks: ContentBlock[]) {
    onChange(value.map((p) => {
      if (p.id !== id) return p
      return { ...p, variants: p.variants.map((v) => v.id === p.activeVariantId ? { ...v, content: blocks } : v) }
    }))
  }

  function addVariant(id: string) {
    onChange(value.map((p) => {
      if (p.id !== id) return p
      const nv: ContentVariant = { id: crypto.randomUUID(), label: `Variant ${p.variants.length + 1}`, content: [] }
      return { ...p, variants: [...p.variants, nv], activeVariantId: nv.id }
    }))
  }

  function deleteVariant(projectId: string, variantId: string) {
    onChange(value.map((p) => {
      if (p.id !== projectId) return p
      const remaining = p.variants.filter((v) => v.id !== variantId)
      return { ...p, variants: remaining, activeVariantId: remaining[remaining.length - 1].id }
    }))
  }

  function renameVariant(projectId: string, variantId: string, label: string) {
    onChange(value.map((p) => {
      if (p.id !== projectId) return p
      return { ...p, variants: p.variants.map((v) => v.id === variantId ? { ...v, label } : v) }
    }))
  }

  return (
    <div className="space-y-2">
      {value.map((project) => {
        const isCollapsed = !expanded.has(project.id)
        const title = [project.title, project.role].filter(Boolean).join(" · ") || "Untitled"
        return (
          <div key={project.id} className="rounded-lg border border-border">
            <div className="flex items-center gap-1 px-3 py-2">
              <button className="flex flex-1 items-center gap-1.5 text-left min-w-0" onClick={() => toggle(project.id)}>
                {isCollapsed
                  ? <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  : <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                <span className="truncate text-sm font-medium">{title}</span>
              </button>
              <div className="flex items-center gap-0.5">
                {onToggleHidden && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onToggleHidden(project.id)}
                    className={hiddenIds?.has(project.id) ? "text-muted-foreground" : ""}
                    title={hiddenIds?.has(project.id) ? "Hidden in active profile" : "Visible in active profile"}
                  >
                    {hiddenIds?.has(project.id) ? <IconEyeOff /> : <IconEye />}
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs" onClick={() => remove(project.id)} className="text-destructive hover:text-destructive">
                  <IconTrash />
                </Button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
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
              </div>
            )}
          </div>
        )
      })}

      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add project
      </Button>
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
      />
    </label>
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
