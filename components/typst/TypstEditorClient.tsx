"use client"

import dynamic from "next/dynamic"

const EditorLayout = dynamic(() => import("@/components/profile/EditorLayout"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100svh-3.5rem-3rem)] items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading editor…</p>
    </div>
  ),
})

export default function TypstEditorClient() {
  return <EditorLayout />
}
