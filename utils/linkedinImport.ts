import {
  Achievement,
  CEFRLevel,
  ContentVariant,
  EducationEntry,
  Identification,
  LanguageSkill,
  LearnerInfo,
  Period,
  Project,
  SkillEntry,
  WorkExperience,
} from "@/types/resume"

// ---------------------------------------------------------------------------
// Minimal CSV parser — handles quoted fields with embedded commas/newlines
// ---------------------------------------------------------------------------

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuote = false

  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1)
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (ch === '"') {
      if (inQuote && text[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (ch === "," && !inQuote) {
      row.push(field)
      field = ""
    } else if ((ch === "\n" || ch === "\r") && !inQuote) {
      if (ch === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      field = ""

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row)
      }
      row = []
    } else {
      field += ch
    }
  }

  // flush final field/row
  row.push(field)
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row)
  }

  if (rows.length < 2) return []

  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cells) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? "").trim()
    })
    return obj
  })
}

// ---------------------------------------------------------------------------
// Date helpers — LinkedIn format: "Mon YYYY" e.g. "Aug 2024"
// ---------------------------------------------------------------------------

function linkedinDateToISO(raw: string): string {
  if (!raw) return ""
  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  }
  const parts = raw.trim().split(" ")
  if (parts.length === 2 && months[parts[0]])
    return `${parts[1]}-${months[parts[0]]}`
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return parts[0]
  return raw
}

function makePeriod(startedOn: string, finishedOn: string): Period {
  const from = linkedinDateToISO(startedOn)
  if (!finishedOn) return { from, current: true }
  return { from, to: linkedinDateToISO(finishedOn) }
}

// ---------------------------------------------------------------------------
// Variant helpers
// ---------------------------------------------------------------------------

function makeVariant(text: string): {
  variants: ContentVariant[]
  activeVariantId: string
} {
  const id = crypto.randomUUID()
  const variant: ContentVariant = {
    id,
    label: "Default",
    content: text ? [{ type: "paragraph", body: text }] : [],
  }
  return { variants: [variant], activeVariantId: id }
}

// ---------------------------------------------------------------------------
// Language proficiency → CEFR (best-effort)
// ---------------------------------------------------------------------------

function linkedinProfToCEFR(prof: string): CEFRLevel {
  const p = prof.toLowerCase()
  if (p.includes("native") || p.includes("bilingual")) return "native"
  if (p.includes("full professional") || p.includes("professional working"))
    return "C1"
  if (p.includes("limited working")) return "B1"
  if (p.includes("elementary")) return "A2"
  return "B2"
}

function makeLanguageSkill(name: string, proficiency: string): LanguageSkill {
  const level = linkedinProfToCEFR(proficiency)
  return {
    language: { label: name },
    listening: level,
    reading: level,
    spokenInteraction: level,
    spokenProduction: level,
    writing: level,
  }
}

// ---------------------------------------------------------------------------
// Skill categorisation (heuristic)
// ---------------------------------------------------------------------------

const LANG_SKILL_NAMES = new Set([
  "english",
  "malay",
  "mandarin",
  "chinese",
  "french",
  "german",
  "spanish",
  "japanese",
  "korean",
  "arabic",
  "hindi",
  "tamil",
])

const CYBER_KEYWORDS = [
  "cybersecurity",
  "malware",
  "penetration",
  "forensics",
  "ethical hacking",
  "network security",
  "information security",
  "digital forensics",
  "computer forensics",
  "siem",
  "malware detection",
  "malware analysis",
]
const AI_KEYWORDS = [
  "machine learning",
  "llm",
  "rag",
  "retrieval",
  "graphrag",
  "data analysis",
  "data visualization",
  "large language",
]
const PROG_KEYWORDS = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c#",
  "c++",
  "sql",
  "html",
  "css",
  "react",
  "node",
  "go",
  "rust",
  "kotlin",
  "swift",
  "ruby",
  "php",
]
const TOOL_KEYWORDS = [
  "microsoft",
  "adobe",
  "windows",
  "linux",
  "docker",
  "git",
  "jira",
  "figma",
  "photoshop",
  "premiere",
  "firestore",
  "sql server",
]

function categoriseSkill(label: string): string {
  const l = label.toLowerCase()
  if (CYBER_KEYWORDS.some((k) => l.includes(k))) return "Cybersecurity"
  if (AI_KEYWORDS.some((k) => l.includes(k))) return "AI & Data"
  if (PROG_KEYWORDS.some((k) => l.includes(k))) return "Programming"
  if (TOOL_KEYWORDS.some((k) => l.includes(k))) return "Tools"
  return "Other"
}

// ---------------------------------------------------------------------------
// Per-CSV parsers
// ---------------------------------------------------------------------------

function parseProfile(rows: Record<string, string>[]): { identification: Identification; headline: string | undefined; about: string | undefined } {
  const r = rows[0] ?? {}
  return {
    identification: {
      personName: {
        firstName: r["First Name"] ?? "",
        surname: r["Last Name"] ?? "",
      },
      contact: {},
    },
    headline: r["Headline"] || undefined,
    about: r["Summary"] || undefined,
  }
}

function parsePositions(rows: Record<string, string>[]): WorkExperience[] {
  return rows.map((r) => ({
    id: crypto.randomUUID(),
    period: makePeriod(r["Started On"] ?? "", r["Finished On"] ?? ""),
    employer: { name: r["Company Name"] ?? "" },
    position: { label: r["Title"] ?? "" },
    ...makeVariant(r["Description"] ?? ""),
  }))
}

function parseEducation(rows: Record<string, string>[]): EducationEntry[] {
  console.log(rows)
  return rows.map((r) => ({
    id: crypto.randomUUID(),
    period: makePeriod(r["Start Date"] ?? "", r["End Date"] ?? ""),
    title: r["Degree Name"] ?? "",
    awardingBody: { name: r["School Name"] ?? "" },
    ...makeVariant(r["Notes"] ?? ""),
  }))
}

function parseSkills(rows: Record<string, string>[]): SkillEntry[] {
  return rows
    .map((r) => r["Name"] ?? "")
    .filter(Boolean)
    .filter((name) => !LANG_SKILL_NAMES.has(name.toLowerCase()))
    .map((name) => ({
      id: crypto.randomUUID(),
      label: name,
      category: categoriseSkill(name),
    }))
}

function parseLanguages(rows: Record<string, string>[]): LanguageSkill[] {
  return rows
    .filter((r) => r["Name"])
    .map((r) => makeLanguageSkill(r["Name"], r["Proficiency"] ?? ""))
}

function parseCertifications(rows: Record<string, string>[]): Achievement[] {
  return rows
    .filter((r) => r["Name"])
    .map((r) => ({
      id: crypto.randomUUID(),
      type: "certification" as const,
      title: r["Name"],
      date: linkedinDateToISO(r["Started On"] ?? ""),
      issuingBody: r["Authority"] || undefined,
      url: r["Url"] || undefined,
      ...makeVariant(""),
    }))
}

function parseHonors(rows: Record<string, string>[]): Achievement[] {
  return rows
    .filter((r) => r["Title"])
    .map((r) => ({
      id: crypto.randomUUID(),
      type: "honour" as const,
      title: r["Title"],
      date: linkedinDateToISO(r["Issued On"] ?? ""),
      issuingBody: r["Issuer"] || undefined,
      ...makeVariant(r["Description"] ?? ""),
    }))
}

function parseProjects(rows: Record<string, string>[]): Project[] {
  return rows
    .filter((r) => r["Title"])
    .map((r) => ({
      id: crypto.randomUUID(),
      title: r["Title"],
      period: r["Started On"]
        ? makePeriod(r["Started On"], r["Finished On"] ?? "")
        : undefined,
      url: r["Url"] || undefined,
      ...makeVariant(r["Description"] ?? ""),
    }))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type LinkedInFileMap = {
  "Profile.csv"?: string
  "Positions.csv"?: string
  "Education.csv"?: string
  "Skills.csv"?: string
  "Languages.csv"?: string
  "Certifications.csv"?: string
  "Honors.csv"?: string
  "Projects.csv"?: string
}

const EXPECTED_FILES = [
  "Profile.csv",
  "Positions.csv",
  "Education.csv",
  "Skills.csv",
  "Languages.csv",
  "Certifications.csv",
  "Honors.csv",
  "Projects.csv",
] as const

export function importFromLinkedIn(
  files: LinkedInFileMap
): Partial<LearnerInfo> {
  const result: Partial<LearnerInfo> = {}

  const profileRows = files["Profile.csv"] ? parseCSV(files["Profile.csv"]) : []
  if (profileRows.length) {
    const { identification, headline, about } = parseProfile(profileRows)
    result.identification = identification
    result.profiles = [{ id: crypto.randomUUID(), label: "Default", hidden: [], variantSelections: {}, headline, about }]
    result.activeProfileId = result.profiles[0].id
  }

  const positionRows = files["Positions.csv"]
    ? parseCSV(files["Positions.csv"])
    : []
  if (positionRows.length) result.workExperience = parsePositions(positionRows)

  const educationRows = files["Education.csv"]
    ? parseCSV(files["Education.csv"])
    : []
  if (educationRows.length) result.education = parseEducation(educationRows)

  const skillRows = files["Skills.csv"] ? parseCSV(files["Skills.csv"]) : []
  const langRows = files["Languages.csv"]
    ? parseCSV(files["Languages.csv"])
    : []
  const langSkills = langRows.length ? parseLanguages(langRows) : []
  const otherSkills = skillRows.length ? parseSkills(skillRows) : []
  if (langSkills.length || otherSkills.length) {
    result.skills = { languages: langSkills, other: otherSkills }
  }

  const certRows = files["Certifications.csv"]
    ? parseCSV(files["Certifications.csv"])
    : []
  const honorRows = files["Honors.csv"] ? parseCSV(files["Honors.csv"]) : []
  const certs = certRows.length ? parseCertifications(certRows) : []
  const honors = honorRows.length ? parseHonors(honorRows) : []
  if (certs.length || honors.length) result.achievements = [...certs, ...honors]

  const projectRows = files["Projects.csv"]
    ? parseCSV(files["Projects.csv"])
    : []
  if (projectRows.length) result.projects = parseProjects(projectRows)

  return result
}

export async function readLinkedInFiles(fileList: FileList): Promise<{
  data: Partial<LearnerInfo>
  matched: string[]
  unrecognised: string[]
}> {
  const map: LinkedInFileMap = {}
  const matched: string[] = []
  const unrecognised: string[] = []

  await Promise.all(
    Array.from(fileList).map(async (file) => {
      if ((EXPECTED_FILES as readonly string[]).includes(file.name)) {
        map[file.name as keyof LinkedInFileMap] = await file.text()
        matched.push(file.name)
      } else {
        unrecognised.push(file.name)
      }
    })
  )

  return { data: importFromLinkedIn(map), matched, unrecognised }
}
