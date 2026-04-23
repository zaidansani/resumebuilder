"use client"

import { Button } from "@/components/ui/button"
import { LearnerInfo, VariantProfile } from "@/types/resume"
import { readLinkedInFiles } from "@/utils/linkedinImport"
import {
  IconBrandLinkedin,
  IconFileText,
  IconUser,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"

interface Props {
  onStartFresh: (firstName: string, surname: string) => void
  onLinkedIn: (partial: Partial<LearnerInfo>) => void
  onImportJson: (data: {
    learner: LearnerInfo
    order?: string[]
    profiles?: VariantProfile[]
    activeProfileId?: string | null
  }) => void
  onClose: () => void
}

type Screen = "home" | "fresh" | "linkedin"

export default function OnboardingModal({
  onStartFresh,
  onLinkedIn,
  onImportJson,
  onClose,
}: Props) {
  const [screen, setScreen] = useState<Screen>("home")
  const [firstName, setFirstName] = useState("")
  const [surname, setSurname] = useState("")
  const [linkedinStatus, setLinkedinStatus] = useState<string | null>(null)
  const linkedinInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  function handleFreshSubmit(e: React.FormEvent) {
    e.preventDefault()
    onStartFresh(firstName.trim(), surname.trim())
  }

  async function handleLinkedInFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setLinkedinStatus("Importing…")
    try {
      const { data, matched } = await readLinkedInFiles(files)
      if (matched.length === 0) {
        setLinkedinStatus("No recognised LinkedIn CSV files found.")
        return
      }
      setLinkedinStatus(`Imported: ${matched.join(", ")}`)
      setTimeout(() => onLinkedIn(data), 600)
    } catch {
      setLinkedinStatus("Failed to parse files.")
    }
    e.target.value = ""
  }

  function handleJsonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!parsed.learner) throw new Error("missing learner")
        onImportJson(parsed)
      } catch {
        alert("Invalid JSON file — expected a Resume Builder export.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <IconX className="h-4 w-4" />
        </button>

        {screen === "home" && (
          <>
            <h2 className="mb-1 text-lg font-semibold">Get started</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Start from scratch, import your LinkedIn data, or load a previous
              export.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setScreen("fresh")}
                className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
              >
                <IconUser className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start fresh</p>
                  <p className="text-xs text-muted-foreground">
                    Begin with a blank resume
                  </p>
                </div>
              </button>

              <button
                onClick={() => setScreen("linkedin")}
                className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
              >
                <IconBrandLinkedin className="h-5 w-5 shrink-0 text-[#0077b5]" />
                <div>
                  <p className="text-sm font-medium">Import from LinkedIn</p>
                  <p className="text-xs text-muted-foreground">
                    Upload your LinkedIn data export CSVs.
                  </p>
                </div>
              </button>

              <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted">
                <IconFileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Load saved resume</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a Resume Builder JSON export
                  </p>
                </div>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleJsonFile}
                />
              </label>
            </div>
          </>
        )}

        {screen === "fresh" && (
          <>
            <button
              onClick={() => setScreen("home")}
              className="mb-4 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h2 className="mb-1 text-lg font-semibold">Start fresh</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter your name to begin.
            </p>
            <form onSubmit={handleFreshSubmit} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <Button type="submit" disabled={!firstName.trim()}>
                Create resume
              </Button>
            </form>
          </>
        )}

        {screen === "linkedin" && (
          <>
            <button
              onClick={() => setScreen("home")}
              className="mb-4 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h2 className="mb-1 text-lg font-semibold">Import from LinkedIn</h2>
            <p className="mb-2 text-sm text-muted-foreground">
              Select one or more CSV files from your LinkedIn data export. To
              export from LinkedIn, you can refer to the{" "}
              <a
                className="underline"
                href="https://www.linkedin.com/help/linkedin/answer/a1339364/downloading-your-account-data"
              >
                link
              </a>{" "}
              here.
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              Recognised files:
            </p>
            <p className="mb-6 font-mono text-xs text-muted-foreground">
              Profile.csv · Positions.csv · Education.csv · Skills.csv ·
              Languages.csv · Certifications.csv · Honors.csv · Projects.csv
            </p>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted">
              <IconBrandLinkedin className="h-4 w-4 text-[#0077b5]" />
              Click to select CSV files
              <input
                ref={linkedinInputRef}
                type="file"
                accept=".csv,text/csv"
                multiple
                className="hidden"
                onChange={handleLinkedInFiles}
              />
            </label>

            {linkedinStatus && (
              <p className="mt-3 text-xs text-muted-foreground">
                {linkedinStatus}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
