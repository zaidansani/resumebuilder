import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, "..", "public", "typst", "templates")
const OUT = path.join(TEMPLATES_DIR, "manifest.json")
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

function readEntries(dir, urlBase, readSidecar = false) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".typ"))
    .map((f) => {
      const id = f.replace(/\.typ$/, "")
      const entry = { id, label: id.charAt(0).toUpperCase() + id.slice(1), url: `${urlBase}/${f}` }
      if (readSidecar) {
        const sidecarPath = path.join(dir, `${id}.json`)
        if (fs.existsSync(sidecarPath)) {
          try {
            const sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf8"))
            if (sidecar.label) entry.label = sidecar.label
            if (sidecar.sectionDefaults) entry.sectionDefaults = sidecar.sectionDefaults
          } catch {
            console.warn(`Skipping malformed sidecar: ${sidecarPath}`)
          }
        }
      }
      return entry
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

const globalDir = path.join(TEMPLATES_DIR, "global")
const sectionsDir = path.join(TEMPLATES_DIR, "sections")

const manifest = {
  global: readEntries(globalDir, `${BASE_PATH}/typst/templates/global`, true),
  sections: {},
}

if (fs.existsSync(sectionsDir)) {
  for (const key of fs.readdirSync(sectionsDir)) {
    const p = path.join(sectionsDir, key)
    if (fs.statSync(p).isDirectory()) {
      manifest.sections[key] = readEntries(p, `${BASE_PATH}/typst/templates/sections/${key}`)
    }
  }
}

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2))
console.log(`manifest written → ${path.relative(process.cwd(), OUT)}`)
