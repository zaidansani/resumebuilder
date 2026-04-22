"use client"

import { Skills, SkillEntry } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash, IconX } from "@tabler/icons-react"
import { useState } from "react"

interface Props {
  value: Skills
  onChange: (value: Skills) => void
}

function orderedCategories(skills: SkillEntry[]): string[] {
  const seen = new Set<string>()
  const order: string[] = []
  for (const s of skills) {
    const cat = s.category ?? "Other"
    if (!seen.has(cat)) { seen.add(cat); order.push(cat) }
  }
  return order
}

function groupByCategory(skills: SkillEntry[]): Record<string, SkillEntry[]> {
  const groups: Record<string, SkillEntry[]> = {}
  for (const s of skills) {
    const cat = s.category ?? "Other"
    groups[cat] = groups[cat] ?? []
    groups[cat].push(s)
  }
  return groups
}

export default function SkillsSection({ value, onChange }: Props) {
  const [newCategory, setNewCategory] = useState("")
  const categories = orderedCategories(value.other)
  const groups = groupByCategory(value.other)

  function addCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed || groups[trimmed]) return
    setNewCategory("")
    const entry: SkillEntry = { id: crypto.randomUUID(), label: "", category: trimmed }
    onChange({ ...value, other: [...value.other, entry] })
  }

  function removeCategory(cat: string) {
    onChange({ ...value, other: value.other.filter((s) => (s.category ?? "Other") !== cat) })
  }

  function addSkill(cat: string, label: string) {
    const entry: SkillEntry = { id: crypto.randomUUID(), label, category: cat === "Other" ? undefined : cat }
    onChange({ ...value, other: [...value.other, entry] })
  }

  function removeSkill(id: string) {
    onChange({ ...value, other: value.other.filter((s) => s.id !== id) })
  }

  function moveCategoryUp(cat: string) {
    const idx = categories.indexOf(cat)
    if (idx <= 0) return
    const prevCat = categories[idx - 1]
    const catSkills = value.other.filter((s) => (s.category ?? "Other") === cat)
    const prevSkills = value.other.filter((s) => (s.category ?? "Other") === prevCat)
    const before = value.other.filter((s) => {
      const c = s.category ?? "Other"
      return categories.indexOf(c) < idx - 1
    })
    const after = value.other.filter((s) => {
      const c = s.category ?? "Other"
      return categories.indexOf(c) > idx
    })
    onChange({ ...value, other: [...before, ...catSkills, ...prevSkills, ...after] })
  }

  function moveCategoryDown(cat: string) {
    const idx = categories.indexOf(cat)
    if (idx < 0 || idx >= categories.length - 1) return
    const nextCat = categories[idx + 1]
    const catSkills = value.other.filter((s) => (s.category ?? "Other") === cat)
    const nextSkills = value.other.filter((s) => (s.category ?? "Other") === nextCat)
    const before = value.other.filter((s) => {
      const c = s.category ?? "Other"
      return categories.indexOf(c) < idx
    })
    const after = value.other.filter((s) => {
      const c = s.category ?? "Other"
      return categories.indexOf(c) > idx + 1
    })
    onChange({ ...value, other: [...before, ...nextSkills, ...catSkills, ...after] })
  }

  function moveSkillUp(id: string) {
    const skill = value.other.find((s) => s.id === id)
    if (!skill) return
    const cat = skill.category ?? "Other"
    const catSkills = value.other.filter((s) => (s.category ?? "Other") === cat)
    const localIdx = catSkills.findIndex((s) => s.id === id)
    if (localIdx <= 0) return
    const newCatSkills = [...catSkills]
    ;[newCatSkills[localIdx - 1], newCatSkills[localIdx]] = [newCatSkills[localIdx], newCatSkills[localIdx - 1]]
    const catBeforeIdx = categories.indexOf(cat)
    const beforeSkills = value.other.filter((s) => categories.slice(0, catBeforeIdx).includes(s.category ?? "Other"))
    const afterSkills = value.other.filter((s) => categories.slice(catBeforeIdx + 1).includes(s.category ?? "Other"))
    onChange({ ...value, other: [...beforeSkills, ...newCatSkills, ...afterSkills] })
  }

  function moveSkillDown(id: string) {
    const skill = value.other.find((s) => s.id === id)
    if (!skill) return
    const cat = skill.category ?? "Other"
    const catSkills = value.other.filter((s) => (s.category ?? "Other") === cat)
    const localIdx = catSkills.findIndex((s) => s.id === id)
    if (localIdx >= catSkills.length - 1) return
    const newCatSkills = [...catSkills]
    ;[newCatSkills[localIdx], newCatSkills[localIdx + 1]] = [newCatSkills[localIdx + 1], newCatSkills[localIdx]]
    const catBeforeIdx = categories.indexOf(cat)
    const beforeCats = categories.slice(0, catBeforeIdx)
    const afterCats = categories.slice(catBeforeIdx + 1)
    const beforeSkills = value.other.filter((s) => beforeCats.includes(s.category ?? "Other"))
    const afterSkills = value.other.filter((s) => afterCats.includes(s.category ?? "Other"))
    onChange({ ...value, other: [...beforeSkills, ...newCatSkills, ...afterSkills] })
  }

  return (
    <div className="space-y-3">
      {categories.map((cat, catIdx) => (
        <CategoryGroup
          key={cat}
          category={cat}
          skills={groups[cat]}
          onAddSkill={(label) => addSkill(cat, label)}
          onRemoveSkill={removeSkill}
          onRemoveCategory={() => removeCategory(cat)}
          onMoveCategoryUp={catIdx > 0 ? () => moveCategoryUp(cat) : undefined}
          onMoveCategoryDown={catIdx < categories.length - 1 ? () => moveCategoryDown(cat) : undefined}
          onMoveSkillUp={moveSkillUp}
          onMoveSkillDown={moveSkillDown}
        />
      ))}

      <div className="flex gap-2">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory() } }}
          placeholder="New category…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
        <Button variant="outline" size="sm" onClick={addCategory} disabled={!newCategory.trim()}>
          <IconPlus className="mr-1.5 h-3.5 w-3.5" />
          Add category
        </Button>
      </div>
    </div>
  )
}

function CategoryGroup({ category, skills, onAddSkill, onRemoveSkill, onRemoveCategory, onMoveCategoryUp, onMoveCategoryDown, onMoveSkillUp, onMoveSkillDown }: {
  category: string
  skills: SkillEntry[]
  onAddSkill: (label: string) => void
  onRemoveSkill: (id: string) => void
  onRemoveCategory: () => void
  onMoveCategoryUp?: () => void
  onMoveCategoryDown?: () => void
  onMoveSkillUp: (id: string) => void
  onMoveSkillDown: (id: string) => void
}) {
  const [input, setInput] = useState("")
  const realSkills = skills.filter((s) => s.label !== "")

  function commit() {
    const trimmed = input.trim()
    if (!trimmed) return
    onAddSkill(trimmed)
    setInput("")
  }

  return (
    <div className="rounded-lg border border-border px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{category}</span>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-xs" onClick={onMoveCategoryUp} disabled={!onMoveCategoryUp}>
            <IconChevronUp />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onMoveCategoryDown} disabled={!onMoveCategoryDown}>
            <IconChevronDown />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onRemoveCategory} className="text-destructive hover:text-destructive">
            <IconTrash />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {realSkills.map((s, i) => (
          <span key={s.id} className="flex items-center gap-0.5 rounded-md border border-border bg-muted px-2 py-0.5 text-xs">
            {i > 0 && (
              <button onClick={() => onMoveSkillUp(s.id)} className="text-muted-foreground hover:text-foreground">
                <IconChevronUp className="h-3 w-3" />
              </button>
            )}
            {i < realSkills.length - 1 && (
              <button onClick={() => onMoveSkillDown(s.id)} className="text-muted-foreground hover:text-foreground">
                <IconChevronDown className="h-3 w-3" />
              </button>
            )}
            <span className="px-0.5">{s.label}</span>
            <button onClick={() => onRemoveSkill(s.id)} className="text-muted-foreground hover:text-foreground">
              <IconX className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit() } }}
          onBlur={commit}
          placeholder="Add skill…"
          className="h-6 min-w-24 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )
}
