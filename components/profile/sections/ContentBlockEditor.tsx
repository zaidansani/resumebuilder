"use client"

import { Button } from "@/components/ui/button"
import {
  BulletBlock,
  ContentBlock,
  KeyValueBlock,
  MetricBlock,
  ParagraphBlock,
  TagsBlock,
} from "@/types/resume"
import { IconGripVertical, IconPlus, IconTrash } from "@tabler/icons-react"
import { useRef } from "react"

interface Props {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
  allowedTypes?: ContentBlock["type"][]
}

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  bullets: "Bullet list",
  paragraph: "Paragraph",
  metric: "Metrics",
  tags: "Tags",
  keyvalue: "Key / Value",
}

function newBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "bullets":
      return { type, items: [""] }
    case "paragraph":
      return { type, body: "" }
    case "metric":
      return { type, items: [{ label: "", value: "" }] }
    case "tags":
      return { type, tags: [""] }
    case "keyvalue":
      return { type, pairs: [{ key: "", value: "" }] }
  }
}

export default function ContentBlockEditor({ blocks, onChange, allowedTypes }: Props) {
  const visibleTypes = (Object.keys(BLOCK_LABELS) as ContentBlock["type"][]).filter(
    (t) => !allowedTypes || allowedTypes.includes(t)
  )
  function add(type: ContentBlock["type"]) {
    onChange([...blocks, newBlock(type)])
  }

  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i))
  }

  function update(i: number, block: ContentBlock) {
    onChange(blocks.map((b, idx) => (idx === i ? block : b)))
  }

  function setHeading(i: number, heading: string) {
    const b = { ...blocks[i], heading: heading || undefined }
    update(i, b as ContentBlock)
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3"
        >
          <div className="flex items-center gap-2">
            <IconGripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <span className="flex-1 text-xs font-medium text-muted-foreground">
              {BLOCK_LABELS[block.type]}
            </span>
            <button
              onClick={() => remove(i)}
              className="text-destructive/70 hover:text-destructive"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </div>

          <input
            value={block.heading ?? ""}
            onChange={(e) => setHeading(i, e.target.value)}
            placeholder="Heading (optional)"
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring/50"
          />

          {block.type === "paragraph" && (
            <ParagraphEditor block={block} onChange={(b) => update(i, b)} />
          )}
          {block.type === "bullets" && (
            <BulletsEditor block={block} onChange={(b) => update(i, b)} />
          )}
          {block.type === "tags" && (
            <TagsEditor block={block} onChange={(b) => update(i, b)} />
          )}
          {block.type === "metric" && (
            <MetricEditor block={block} onChange={(b) => update(i, b)} />
          )}
          {block.type === "keyvalue" && (
            <KeyValueEditor block={block} onChange={(b) => update(i, b)} />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5">
        {visibleTypes.map((type) => (
          <Button
            key={type}
            variant="outline"
            size="xs"
            onClick={() => add(type)}
          >
            <IconPlus className="h-3 w-3" />
            {BLOCK_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ── block editors ────────────────────────────────────────────────────────────

function ParagraphEditor({
  block,
  onChange,
}: {
  block: ParagraphBlock
  onChange: (b: ParagraphBlock) => void
}) {
  return (
    <textarea
      value={block.body}
      onChange={(e) => onChange({ ...block, body: e.target.value })}
      placeholder="Write something…"
      rows={3}
      className="w-full resize-y rounded border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
    />
  )
}

function BulletsEditor({
  block,
  onChange,
}: {
  block: BulletBlock
  onChange: (b: BulletBlock) => void
}) {
  function setItem(i: number, v: string) {
    const items = block.items.map((x, idx) => (idx === i ? v : x))
    onChange({ ...block, items })
  }

  function addItem() {
    onChange({ ...block, items: [...block.items, ""] })
  }

  function removeItem(i: number) {
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })
  }

  const itemRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "Enter") return
    e.preventDefault()
    addItem()
    setTimeout(() => itemRefs.current[i + 1]?.focus(), 0)
  }

  return (
    <div className="space-y-1.5">
      {block.items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">•</span>
          <input
            ref={(el) => { itemRefs.current[i] = el }}
            value={item}
            onChange={(e) => setItem(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder="Bullet point"
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
          <button
            onClick={() => removeItem(i)}
            className="text-destructive/60 hover:text-destructive"
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="xs" onClick={addItem}>
        <IconPlus className="h-3 w-3" /> Add bullet
      </Button>
    </div>
  )
}

function TagsEditor({
  block,
  onChange,
}: {
  block: TagsBlock
  onChange: (b: TagsBlock) => void
}) {
  return (
    <input
      value={block.tags.join(", ")}
      onChange={(e) =>
        onChange({
          ...block,
          tags: e.target.value.split(",").map((t) => t.trimStart()),
        })
      }
      placeholder="tag1, tag2, tag3"
      className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
    />
  )
}

function MetricEditor({
  block,
  onChange,
}: {
  block: MetricBlock
  onChange: (b: MetricBlock) => void
}) {
  function setItem(
    i: number,
    patch: Partial<{ label: string; value: string }>
  ) {
    onChange({
      ...block,
      items: block.items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)),
    })
  }

  function addItem() {
    onChange({ ...block, items: [...block.items, { label: "", value: "" }] })
  }

  function removeItem(i: number) {
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })
  }

  const labelRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "Enter") return
    e.preventDefault()
    addItem()
    setTimeout(() => labelRefs.current[i + 1]?.focus(), 0)
  }

  return (
    <div className="space-y-1.5">
      {block.items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            ref={(el) => { labelRefs.current[i] = el }}
            value={item.label}
            onChange={(e) => setItem(i, { label: e.target.value })}
            placeholder="Label"
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
          <input
            value={item.value}
            onChange={(e) => setItem(i, { value: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder="Value"
            className="w-28 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
          <button
            onClick={() => removeItem(i)}
            className="text-destructive/60 hover:text-destructive"
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="xs" onClick={addItem}>
        <IconPlus className="h-3 w-3" /> Add metric
      </Button>
    </div>
  )
}

function KeyValueEditor({
  block,
  onChange,
}: {
  block: KeyValueBlock
  onChange: (b: KeyValueBlock) => void
}) {
  function setItem(i: number, patch: Partial<{ key: string; value: string }>) {
    onChange({
      ...block,
      pairs: block.pairs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)),
    })
  }

  function addItem() {
    onChange({ ...block, pairs: [...block.pairs, { key: "", value: "" }] })
  }

  function removeItem(i: number) {
    onChange({ ...block, pairs: block.pairs.filter((_, idx) => idx !== i) })
  }

  const keyRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "Enter") return
    e.preventDefault()
    addItem()
    setTimeout(() => keyRefs.current[i + 1]?.focus(), 0)
  }

  return (
    <div className="space-y-1.5">
      {block.pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            ref={(el) => { keyRefs.current[i] = el }}
            value={pair.key}
            onChange={(e) => setItem(i, { key: e.target.value })}
            placeholder="Key"
            className="w-28 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
          <input
            value={pair.value}
            onChange={(e) => setItem(i, { value: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder="Value"
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
          <button
            onClick={() => removeItem(i)}
            className="text-destructive/60 hover:text-destructive"
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="xs" onClick={addItem}>
        <IconPlus className="h-3 w-3" /> Add pair
      </Button>
    </div>
  )
}
