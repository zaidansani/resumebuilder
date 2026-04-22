"use client"

import { Button } from "@/components/ui/button"
import { ContentVariant } from "@/types/resume"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useRef, useState } from "react"

interface Props {
  variants: ContentVariant[]
  activeId: string
  onSwitch: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onRename: (id: string, label: string) => void
}

export default function VariantTabs({
  variants,
  activeId,
  onSwitch,
  onAdd,
  onDelete,
  onRename,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit(id: string) {
    setEditingId(id)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commitEdit(id: string, val: string) {
    const trimmed = val.trim()
    if (trimmed) onRename(id, trimmed)
    setEditingId(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {variants.map((v) => {
        const isActive = v.id === activeId
        return (
          <div key={v.id} className="group relative flex items-center">
            {editingId === v.id ? (
              <input
                ref={inputRef}
                defaultValue={v.label}
                className="h-6 w-24 rounded border border-ring bg-background px-2 text-xs outline-none"
                onBlur={(e) => commitEdit(v.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(v.id, e.currentTarget.value)
                  if (e.key === "Escape") setEditingId(null)
                }}
              />
            ) : (
              <button
                onClick={() => onSwitch(v.id)}
                onDoubleClick={() => startEdit(v.id)}
                className={`h-6 rounded px-2 text-xs transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {v.label}
              </button>
            )}
            {isActive && variants.length > 1 && editingId !== v.id && (
              <button
                onClick={() => onDelete(v.id)}
                className="text-destructive-foreground absolute -top-1.5 -right-1.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive group-hover:flex"
              >
                <IconTrash className="h-2 w-2" />
              </button>
            )}
          </div>
        )
      })}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onAdd}
        title="Add variant"
      >
        <IconPlus className="h-3 w-3" />
      </Button>
    </div>
  )
}
