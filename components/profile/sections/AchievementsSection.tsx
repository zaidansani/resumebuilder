"use client"

import { Achievement, ContentBlock, ContentVariant } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { IconChevronDown, IconChevronRight, IconEye, IconEyeOff, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import ContentBlockVariantEditor from "./ContentBlockVariantEditor"

interface Props {
  value: Achievement[]
  onChange: (value: Achievement[]) => void
  hiddenIds?: Set<string>
  onToggleHidden?: (id: string) => void
}

const TYPES: Achievement["type"][] = ["award", "honour", "scholarship", "certification", "other"]

function newAchievement(): Achievement {
  const variantId = crypto.randomUUID()
  return {
    id: crypto.randomUUID(),
    type: "award",
    title: "",
    variants: [{ id: variantId, label: "Default", content: [] }],
    activeVariantId: variantId,
  }
}

export default function AchievementsSection({ value, onChange, hiddenIds, onToggleHidden }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((s) => { const n = new Set(s); s.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function add() {
    onChange([...value, newAchievement()])
  }

  function remove(id: string) {
    onChange(value.filter((a) => a.id !== id))
  }

  function update(id: string, patch: Partial<Achievement>) {
    onChange(value.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function updateBlocks(id: string, blocks: ContentBlock[]) {
    onChange(value.map((a) => {
      if (a.id !== id) return a
      return { ...a, variants: a.variants.map((v) => v.id === a.activeVariantId ? { ...v, content: blocks } : v) }
    }))
  }

  function addVariant(id: string) {
    onChange(value.map((a) => {
      if (a.id !== id) return a
      const nv: ContentVariant = { id: crypto.randomUUID(), label: `Variant ${a.variants.length + 1}`, content: [] }
      return { ...a, variants: [...a.variants, nv], activeVariantId: nv.id }
    }))
  }

  function deleteVariant(itemId: string, variantId: string) {
    onChange(value.map((a) => {
      if (a.id !== itemId) return a
      const remaining = a.variants.filter((v) => v.id !== variantId)
      return { ...a, variants: remaining, activeVariantId: remaining[remaining.length - 1].id }
    }))
  }

  function renameVariant(itemId: string, variantId: string, label: string) {
    onChange(value.map((a) => {
      if (a.id !== itemId) return a
      return { ...a, variants: a.variants.map((v) => v.id === variantId ? { ...v, label } : v) }
    }))
  }

  return (
    <div className="space-y-2">
      {value.map((item) => {
        const isCollapsed = !expanded.has(item.id)
        const title = item.title || "Untitled"
        return (
          <div key={item.id} className="rounded-lg border border-border">
            <div className="flex items-center gap-1 px-3 py-2">
              <button className="flex flex-1 items-center gap-1.5 text-left min-w-0" onClick={() => toggle(item.id)}>
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
                    onClick={() => onToggleHidden(item.id)}
                    className={hiddenIds?.has(item.id) ? "text-muted-foreground" : ""}
                    title={hiddenIds?.has(item.id) ? "Hidden in active profile" : "Visible in active profile"}
                  >
                    {hiddenIds?.has(item.id) ? <IconEyeOff /> : <IconEye />}
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs" onClick={() => remove(item.id)} className="text-destructive hover:text-destructive">
                  <IconTrash />
                </Button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title" value={item.title} onChange={(v) => update(item.id, { title: v })} />
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Type</span>
                    <select
                      value={item.type}
                      onChange={(e) => update(item.id, { type: e.target.value as Achievement["type"] })}
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Issuing body" value={item.issuingBody ?? ""} onChange={(v) => update(item.id, { issuingBody: v || undefined })} />
                  <Field label="Date" value={item.date ?? ""} onChange={(v) => update(item.id, { date: v || undefined })} type="date" />
                </div>

                <ContentBlockVariantEditor
                  variants={item.variants}
                  activeVariantId={item.activeVariantId}
                  allowedTypes={["paragraph", "bullets"]}
                  onBlocksChange={(blocks) => updateBlocks(item.id, blocks)}
                  onVariantSwitch={(vid) => update(item.id, { activeVariantId: vid })}
                  onVariantAdd={() => addVariant(item.id)}
                  onVariantDelete={(vid) => deleteVariant(item.id, vid)}
                  onVariantRename={(vid, label) => renameVariant(item.id, vid, label)}
                />
              </div>
            )}
          </div>
        )
      })}

      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add achievement
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
