"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPlayerPlay } from "@tabler/icons-react"
import { compileTypst, compileTypstPdf, downloadBlob } from "@/utils/typst"
import TypstPreview from "./TypstPreview"

const DEFAULT_SOURCE = `#set page(paper: "a4")
#set text(font: "Linux Libertine", size: 11pt)

= My Resume

== Experience

*Software Engineer* | Acme Corp | 2022–present

- Built things
- Fixed things

== Education

*BSc Computer Science* | Some University | 2018–2022
`

export default function TypstEditor() {
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [artifact, setArtifact] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)

  async function compile() {
    setRendering(true)
    setError(null)
    try {
      setArtifact(await compileTypst(source))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRendering(false)
    }
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem-3rem)] divide-x divide-border">
      <div className="flex w-1/2 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Typst</span>
          <Button size="sm" onClick={compile} disabled={rendering}>
            <IconPlayerPlay className="mr-1.5 h-3.5 w-3.5" />
            {rendering ? "Compiling…" : "Render"}
          </Button>
        </div>
        <textarea
          className="flex-1 resize-none bg-background p-4 font-mono text-sm text-foreground outline-none"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
        />
      </div>

      <TypstPreview
        artifact={artifact}
        error={error}
        onExportPdf={async () => {
          const pdf = await compileTypstPdf(source)
          downloadBlob(pdf, "resume.pdf", "application/pdf")
        }}
      />
    </div>
  )
}
