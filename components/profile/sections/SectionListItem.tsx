"use client"

import { Button } from "@/components/ui/button"
import { IconChevronDown, IconChevronRight, IconChevronUp, IconEye, IconEyeOff, IconTrash } from "@tabler/icons-react"

interface Props {
  id: string
  title: string
  isExpanded: boolean
  onToggle: () => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  hiddenIds?: Set<string>
  onToggleHidden?: (id: string) => void
  children: React.ReactNode
}

export default function SectionListItem({ id, title, isExpanded, onToggle, onRemove, onMoveUp, onMoveDown, hiddenIds, onToggleHidden, children }: Props) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-1 px-3 py-2">
        <button className="flex flex-1 items-center gap-1.5 text-left min-w-0" onClick={onToggle}>
          {isExpanded
            ? <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            : <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className="truncate text-sm font-medium">{title}</span>
        </button>
        <div className="flex items-center gap-0.5">
          {(onMoveUp !== undefined || onMoveDown !== undefined) && (
            <>
              <Button variant="ghost" size="icon-xs" onClick={onMoveUp} disabled={!onMoveUp}>
                <IconChevronUp />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={onMoveDown} disabled={!onMoveDown}>
                <IconChevronDown />
              </Button>
            </>
          )}
          {onToggleHidden && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onToggleHidden(id)}
              className={hiddenIds?.has(id) ? "text-muted-foreground" : ""}
              title={hiddenIds?.has(id) ? "Hidden in active profile" : "Visible in active profile"}
            >
              {hiddenIds?.has(id) ? <IconEyeOff /> : <IconEye />}
            </Button>
          )}
          <Button variant="ghost" size="icon-xs" onClick={onRemove} className="text-destructive hover:text-destructive">
            <IconTrash />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
