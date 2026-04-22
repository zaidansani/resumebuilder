"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IconDownload } from "@tabler/icons-react"

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5] as const
type ZoomLevel = (typeof ZOOM_LEVELS)[number]
type Zoom = ZoomLevel | "fit"

const A4_W = 794
const PADDING = 48

interface TypstPreviewProps {
  artifact: Uint8Array | null
  error: string | null
  onExportPdf?: () => Promise<void>
}

export default function TypstPreview({ artifact, error, onExportPdf }: TypstPreviewProps) {
  const [zoom, setZoom] = useState<Zoom>("fit")
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!onExportPdf) return
    setExporting(true)
    try {
      await onExportPdf()
    } finally {
      setExporting(false)
    }
  }
  const [fitScale, setFitScale] = useState(1)
  const [innerH, setInnerH] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const TypstDocumentRef = useRef<typeof import("@myriaddreamin/typst.react").TypstDocument | null>(null)
  const [, forceUpdate] = useState(0)

  const updateFitScale = useCallback(() => {
    if (!containerRef.current) return
    const availableW = containerRef.current.clientWidth - PADDING * 2
    setFitScale(Math.min(1, availableW / A4_W))
  }, [])

  useEffect(() => {
    updateFitScale()
    const ro = new ResizeObserver(updateFitScale)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [updateFitScale])

  useEffect(() => {
    if (!innerRef.current) return
    const ro = new ResizeObserver(() => {
      setInnerH(innerRef.current?.scrollHeight ?? 0)
    })
    ro.observe(innerRef.current)
    return () => ro.disconnect()
  }, [artifact])

  useEffect(() => {
    async function init() {
      const mod = await import("@myriaddreamin/typst.react")
      TypstDocumentRef.current = mod.TypstDocument
      forceUpdate((n) => n + 1)
    }
    init()
  }, [])

  const scale = zoom === "fit" ? fitScale : zoom
  const scaledW = A4_W * scale
  const TypstDocument = TypstDocumentRef.current

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ width: 700 }}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2 h-[41px]">
        <span className="text-xs font-medium text-muted-foreground">Preview</span>
        <div className="flex items-center gap-2">
          {onExportPdf && (
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting || !artifact}>
              <IconDownload className="mr-1.5 h-3.5 w-3.5" />
              {exporting ? "Exporting…" : "Export PDF"}
            </Button>
          )}
        <Select
          value={String(zoom)}
          onValueChange={(v) => setZoom(v === "fit" ? "fit" : (Number(v) as ZoomLevel))}
        >
          <SelectTrigger className="h-7 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fit" className="text-xs">Fit</SelectItem>
            {ZOOM_LEVELS.map((z) => (
              <SelectItem key={z} value={String(z)} className="text-xs">
                {Math.round(z * 100)}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`min-h-0 flex-1 bg-muted p-6 overflow-y-auto ${zoom === "fit" ? "overflow-x-hidden" : "overflow-x-auto"}`}
      >
        {error && (
          <pre className="text-xs whitespace-pre-wrap text-destructive">{error}</pre>
        )}
        {!error && artifact && TypstDocument && (
          <>
            <style>{`
              .typst-page {
                border-radius: 0.5rem;
                box-shadow: 0 4px 24px rgba(0,0,0,0.18);
                margin-bottom: 40px;
                overflow: hidden;
              }
              .typst-page:last-child {
                margin-bottom: 0;
              }
            `}</style>
            <div className="mx-auto" style={{ width: scaledW, height: innerH * scale + 24 }}>
              <div
                ref={innerRef}
                style={{
                  width: A4_W,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <TypstDocument artifact={artifact} />
              </div>
            </div>
          </>
        )}
        {!error && !artifact && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Press Render to preview</p>
          </div>
        )}
      </div>
    </div>
  )
}
