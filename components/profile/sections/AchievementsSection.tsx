"use client"

import { Achievement } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import ContentBlockVariantEditor from "./ContentBlockVariantEditor"
import Field from "./Field"
import { useListSection } from "./hooks/useListSection"
import SectionListItem from "./SectionListItem"

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
  const { expanded, toggle, add, remove, update, updateBlocks, addVariant, deleteVariant, renameVariant, moveUp, moveDown } =
    useListSection(value, onChange)

  return (
    <div className="space-y-2">
      {value.map((item, index) => {
        const title = item.title || "Untitled"
        return (
          <SectionListItem
            key={item.id}
            id={item.id}
            title={title}
            isExpanded={expanded.has(item.id)}
            onToggle={() => toggle(item.id)}
            onRemove={() => remove(item.id)}
            onMoveUp={index > 0 ? () => moveUp(item.id) : undefined}
            onMoveDown={index < value.length - 1 ? () => moveDown(item.id) : undefined}
            hiddenIds={hiddenIds}
            onToggleHidden={onToggleHidden}
          >
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
          </SectionListItem>
        )
      })}

      <Button variant="outline" size="sm" onClick={() => add(newAchievement())} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add achievement
      </Button>
    </div>
  )
}
