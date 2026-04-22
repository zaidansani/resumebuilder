"use client"

import { Skills, SkillEntry } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { IconPlus, IconTrash } from "@tabler/icons-react"

interface Props {
  value: Skills
  onChange: (value: Skills) => void
}

export default function SkillsSection({ value, onChange }: Props) {
  function addSkill() {
    const entry: SkillEntry = { id: crypto.randomUUID(), label: "" }
    onChange({ ...value, other: [...value.other, entry] })
  }

  function removeSkill(id: string) {
    onChange({ ...value, other: value.other.filter((s) => s.id !== id) })
  }

  function updateSkill(id: string, patch: Partial<SkillEntry>) {
    onChange({
      ...value,
      other: value.other.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Skills</p>
      <div className="space-y-2">
        {value.other.map((skill) => (
          <div key={skill.id} className="flex items-center gap-2">
            <input
              value={skill.label}
              onChange={(e) => updateSkill(skill.id, { label: e.target.value })}
              placeholder="Skill name"
              className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            />
            <input
              value={skill.category ?? ""}
              onChange={(e) =>
                updateSkill(skill.id, { category: e.target.value || undefined })
              }
              placeholder="Category"
              className="w-32 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            />
            <select
              value={skill.proficiency ?? ""}
              onChange={(e) =>
                updateSkill(skill.id, {
                  proficiency: e.target.value
                    ? (Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
                    : undefined,
                })
              }
              className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">Level</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => removeSkill(skill.id)}
              className="text-destructive hover:text-destructive"
            >
              <IconTrash />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addSkill} className="w-full">
        <IconPlus className="mr-1.5 h-3.5 w-3.5" />
        Add skill
      </Button>
    </div>
  )
}
