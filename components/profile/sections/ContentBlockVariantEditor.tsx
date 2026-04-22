"use client"

import { ContentBlock, ContentVariant } from "@/types/resume"
import ContentBlockEditor from "./ContentBlockEditor"
import VariantTabs from "./VariantTabs"

interface Props {
  variants: ContentVariant[]
  activeVariantId: string
  allowedTypes?: ContentBlock["type"][]
  onBlocksChange: (blocks: ContentBlock[]) => void
  onVariantSwitch: (id: string) => void
  onVariantAdd: () => void
  onVariantDelete: (id: string) => void
  onVariantRename: (id: string, label: string) => void
}

export default function ContentBlockVariantEditor({
  variants,
  activeVariantId,
  allowedTypes,
  onBlocksChange,
  onVariantSwitch,
  onVariantAdd,
  onVariantDelete,
  onVariantRename,
}: Props) {
  const activeBlocks = variants.find((v) => v.id === activeVariantId)?.content ?? []

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Content</span>
        <VariantTabs
          variants={variants}
          activeId={activeVariantId}
          onSwitch={onVariantSwitch}
          onAdd={onVariantAdd}
          onDelete={onVariantDelete}
          onRename={onVariantRename}
        />
      </div>
      <div className="p-3">
        <ContentBlockEditor
          blocks={activeBlocks}
          onChange={onBlocksChange}
          allowedTypes={allowedTypes}
        />
      </div>
    </div>
  )
}
