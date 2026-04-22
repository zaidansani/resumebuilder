"use client"

import { Button } from "@/components/ui/button"
import { ContentBlock, ContentVariant, EducationEntry } from "@/types/resume"
import { IconChevronDown, IconChevronRight, IconEye, IconEyeOff, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import ContentBlockVariantEditor from "./ContentBlockVariantEditor"

interface Props {
  value: EducationEntry[]
  onChange: (value: EducationEntry[]) => void
  hiddenIds?: Set<string>
  onToggleHidden?: (id: string) => void
}

function newEntry(): EducationEntry {
  const variantId = crypto.randomUUID()
  return {
    id: crypto.randomUUID(),
    period: { from: "", current: true },
    title: "",
    awardingBody: { name: "" },
    variants: [{ id: variantId, label: "Default", content: [] }],
    activeVariantId: variantId,
  }
}

export default function EducationSection({ value, onChange, hiddenIds, onToggleHidden }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((s) => { const n = new Set(s); s.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function add() {
    onChange([...value, newEntry()])
  }

  function remove(id: string) {
    onChange(value.filter((e) => e.id !== id))
  }

  function update(id: string, patch: Partial<EducationEntry>) {
    onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function updateBlocks(id: string, blocks: ContentBlock[]) {
    onChange(value.map((e) => {
      if (e.id !== id) return e
      return { ...e, variants: e.variants.map((v) => v.id === e.activeVariantId ? { ...v, content: blocks } : v) }
    }))
  }

  function addVariant(id: string) {
    onChange(value.map((e) => {
      if (e.id !== id) return e
      const nv: ContentVariant = { id: crypto.randomUUID(), label: `Variant ${e.variants.length + 1}`, content: [] }
      return { ...e, variants: [...e.variants, nv], activeVariantId: nv.id }
    }))
  }

  function deleteVariant(entryId: string, variantId: string) {
    onChange(value.map((e) => {
      if (e.id !== entryId) return e
      const remaining = e.variants.filter((v) => v.id !== variantId)
      return { ...e, variants: remaining, activeVariantId: remaining[remaining.length - 1].id }
    }))
  }

  function renameVariant(entryId: string, variantId: string, label: string) {
    onChange(value.map((e) => {
      if (e.id !== entryId) return e
      return { ...e, variants: e.variants.map((v) => v.id === variantId ? { ...v, label } : v) }
    }))
  }

  return (
    <div className="space-y-2">
      {value.map((entry) => {
        const isCollapsed = !expanded.has(entry.id)
        const title = [entry.title, entry.awardingBody.name].filter(Boolean).join(" · ") || "Untitled"
        return (
          <div key={entry.id} className="rounded-lg border border-border">
            <div className="flex items-center gap-1 px-3 py-2">
              <button className="flex flex-1 items-center gap-1.5 text-left min-w-0" onClick={() => toggle(entry.id)}>
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
                    onClick={() => onToggleHidden(entry.id)}
                    className={hiddenIds?.has(entry.id) ? "text-muted-foreground" : ""}
                    title={hiddenIds?.has(entry.id) ? "Hidden in active profile" : "Visible in active profile"}
                  >
                    {hiddenIds?.has(entry.id) ? <IconEyeOff /> : <IconEye />}
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs" onClick={() => remove(entry.id)} className="text-destructive hover:text-destructive">
                  <IconTrash />
                </Button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Qualification title" value={entry.title} onChange={(v) => update(entry.id, { title: v })} />
                  <Field label="Institution" value={entry.awardingBody.name} onChange={(v) => update(entry.id, { awardingBody: { ...entry.awardingBody, name: v } })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Field of study" value={entry.field?.label ?? ""} onChange={(v) => update(entry.id, { field: v ? { label: v } : undefined })} />
                  <Field label="Grade" value={entry.grade ?? ""} onChange={(v) => update(entry.id, { grade: v || undefined })} />
                </div>

                <ContentBlockVariantEditor
                  variants={entry.variants}
                  activeVariantId={entry.activeVariantId}
                  allowedTypes={["bullets", "paragraph"]}
                  onBlocksChange={(blocks) => updateBlocks(entry.id, blocks)}
                  onVariantSwitch={(vid) => update(entry.id, { activeVariantId: vid })}
                  onVariantAdd={() => addVariant(entry.id)}
                  onVariantDelete={(vid) => deleteVariant(entry.id, vid)}
                  onVariantRename={(vid, label) => renameVariant(entry.id, vid, label)}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Field label="From" value={entry.period.from} onChange={(v) => update(entry.id, { period: { ...entry.period, from: v } })} type="month" />
                  <Field
                    label="To"
                    value={entry.period.to ?? ""}
                    onChange={(v) => update(entry.id, { period: { ...entry.period, to: v || undefined, current: !v } })}
                    type="month"
                    disabled={entry.period.current}
                  />
                  <label className="flex flex-col justify-end gap-1 pb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Current</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={entry.period.current ?? false}
                        onChange={(e) => update(entry.id, { period: { ...entry.period, current: e.target.checked, to: e.target.checked ? undefined : entry.period.to } })}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">Ongoing</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add education
      </Button>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", disabled }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-40"
      />
    </label>
  )
}
