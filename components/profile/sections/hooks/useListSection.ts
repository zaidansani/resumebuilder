import { ContentBlock, ContentVariant } from "@/types/resume"
import { useState } from "react"

export interface ListEntry {
  id: string
  variants: ContentVariant[]
  activeVariantId: string
}

export function useListSection<T extends ListEntry>(
  value: T[],
  onChange: (value: T[]) => void,
) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((s) => { const n = new Set(s); s.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function add(entry: T) {
    onChange([...value, entry])
  }

  function remove(id: string) {
    onChange(value.filter((e) => e.id !== id))
  }

  function update(id: string, patch: Partial<T>) {
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

  function moveUp(id: string) {
    const idx = value.findIndex((e) => e.id === id)
    if (idx <= 0) return
    const next = [...value]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    onChange(next)
  }

  function moveDown(id: string) {
    const idx = value.findIndex((e) => e.id === id)
    if (idx < 0 || idx >= value.length - 1) return
    const next = [...value]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    onChange(next)
  }

  return { expanded, toggle, add, remove, update, updateBlocks, addVariant, deleteVariant, renameVariant, moveUp, moveDown }
}
