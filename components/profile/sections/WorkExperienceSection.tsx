"use client"

import { Button } from "@/components/ui/button"
import { WorkExperience } from "@/types/resume"
import { IconPlus } from "@tabler/icons-react"
import ContentBlockVariantEditor from "./ContentBlockVariantEditor"
import Field from "./Field"
import { useListSection } from "./hooks/useListSection"
import SectionListItem from "./SectionListItem"

interface Props {
  value: WorkExperience[]
  onChange: (value: WorkExperience[]) => void
  hiddenIds?: Set<string>
  onToggleHidden?: (id: string) => void
}

function newEntry(): WorkExperience {
  const variantId = crypto.randomUUID()
  return {
    id: crypto.randomUUID(),
    period: { from: "", current: true },
    employer: { name: "" },
    position: { label: "" },
    variants: [{ id: variantId, label: "Default", content: [] }],
    activeVariantId: variantId,
  }
}

export default function WorkExperienceSection({ value, onChange, hiddenIds, onToggleHidden }: Props) {
  const { expanded, toggle, add, remove, update, updateBlocks, addVariant, deleteVariant, renameVariant, moveUp, moveDown } =
    useListSection(value, onChange)

  return (
    <div className="space-y-2">
      {value.map((entry, index) => {
        const title = [entry.position.label, entry.employer.name].filter(Boolean).join(" · ") || "Untitled"
        return (
          <SectionListItem
            key={entry.id}
            id={entry.id}
            title={title}
            isExpanded={expanded.has(entry.id)}
            onToggle={() => toggle(entry.id)}
            onRemove={() => remove(entry.id)}
            onMoveUp={index > 0 ? () => moveUp(entry.id) : undefined}
            onMoveDown={index < value.length - 1 ? () => moveDown(entry.id) : undefined}
            hiddenIds={hiddenIds}
            onToggleHidden={onToggleHidden}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employer" value={entry.employer.name} onChange={(v) => update(entry.id, { employer: { ...entry.employer, name: v } })} />
              <Field label="Position" value={entry.position.label} onChange={(v) => update(entry.id, { position: { ...entry.position, label: v } })} />
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
          </SectionListItem>
        )
      })}

      <Button variant="outline" size="sm" onClick={() => add(newEntry())} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add position
      </Button>
    </div>
  )
}
