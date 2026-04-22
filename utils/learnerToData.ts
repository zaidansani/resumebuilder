import { LearnerInfo, ContentBlock, ContentVariant, VariantProfile } from "@/types/resume"

// Flattened block shapes the template can iterate without discriminating on type
export type SerializedBlock =
  | { type: "paragraph"; heading: string; body: string }
  | { type: "bullets";   heading: string; items: string[] }
  | { type: "tags";      heading: string; tags: string[] }
  | { type: "metric";    heading: string; items: { label: string; value: string }[] }
  | { type: "keyvalue";  heading: string; pairs: { key: string; value: string }[] }

function serializeBlocks(variants: ContentVariant[], activeId: string): SerializedBlock[] {
  const variant = variants.find((v) => v.id === activeId)
  if (!variant) return []
  return variant.content.map((b: ContentBlock): SerializedBlock => {
    const heading = b.heading ?? ""
    switch (b.type) {
      case "paragraph": return { type: "paragraph", heading, body: b.body }
      case "bullets":   return { type: "bullets",   heading, items: b.items }
      case "tags":      return { type: "tags",       heading, tags: b.tags }
      case "metric":    return { type: "metric",     heading, items: b.items }
      case "keyvalue":  return { type: "keyvalue",   heading, pairs: b.pairs }
    }
  })
}

export interface ResumeData {
  sectionOrder: string[]
  name: string
  headline: string
  about: string
  contact: { label: string; url: string }[]
  location: { city: string; country: string }
  workExperience: {
    position: string
    employer: string
    period: { from: string; to?: string; current?: boolean }
    blocks: SerializedBlock[]
  }[]
  education: {
    title: string
    field: string
    institution: string
    grade: string
    period: { from: string; to?: string; current?: boolean }
    blocks: SerializedBlock[]
  }[]
  skills: { category: string; items: string[] }[]
  projects: {
    title: string
    role: string
    description: string
    technologies: string[]
    url: string
    repoUrl: string
    blocks: SerializedBlock[]
  }[]
  achievements: {
    title: string
    type: string
    date: string
    issuingBody: string
    blocks: SerializedBlock[]
  }[]
}

export function learnerToData(info: LearnerInfo, sectionOrder: string[] = [], profile?: VariantProfile): ResumeData {
  const { identification, workExperience, education, skills, projects, achievements } = info
  const hidden = new Set(profile?.hidden ?? [])
  const variantFor = (entryId: string, fallback: string) =>
    profile?.variantSelections[entryId] ?? fallback
  const { personName, contact, headline } = identification

  const name = [personName.title, personName.firstName, personName.surname]
    .filter((s): s is string => Boolean(s))
    .join(" ")

  const contactParts: { label: string; url: string }[] = []
  if (contact.email) contactParts.push({ label: contact.email, url: `mailto:${contact.email}` })
  if (contact.phone?.[0]) contactParts.push({ label: contact.phone[0].number, url: `tel:${contact.phone[0].number}` })
  if (contact.website?.[0]) contactParts.push({ label: contact.website[0].url, url: contact.website[0].url })
  if (contact.github) contactParts.push({ label: `github.com/${contact.github}`, url: `https://github.com/${contact.github}` })
  if (contact.linkedin) contactParts.push({ label: `linkedin.com/in/${contact.linkedin}`, url: `https://linkedin.com/in/${contact.linkedin}` })

  const groupedSkills: Record<string, string[]> = {}
  for (const s of skills.other) {
    const cat = s.category ?? "Other"
    groupedSkills[cat] = groupedSkills[cat] ?? []
    groupedSkills[cat].push(s.label)
  }

  return {
    sectionOrder,
    name,
    headline: headline ?? "",
    about: profile?.about ?? identification.about ?? "",
    contact: contactParts,
    location: {
      city: contact.address?.municipality ?? "",
      country: contact.address?.country?.label ?? "",
    },
    workExperience: workExperience.filter((j) => !hidden.has(j.id)).map((j) => ({
      position: j.position.label,
      employer: j.employer.name,
      period: { from: j.period.from, to: j.period.to, current: j.period.current },
      blocks: serializeBlocks(j.variants, variantFor(j.id, j.activeVariantId)),
    })),
    education: education.filter((e) => !hidden.has(e.id)).map((e) => ({
      title: e.title,
      field: e.field?.label ?? "",
      institution: e.awardingBody.name,
      grade: e.grade ?? "",
      period: { from: e.period.from, to: e.period.to, current: e.period.current },
      blocks: serializeBlocks(e.variants, variantFor(e.id, e.activeVariantId)),
    })),
    skills: Object.entries(groupedSkills).map(([category, items]) => ({ category, items })),
    projects: projects.filter((p) => !hidden.has(p.id)).map((p) => ({
      title: p.title,
      role: p.role ?? "",
      description: p.description ?? "",
      technologies: p.technologies ?? [],
      url: p.url ?? "",
      repoUrl: p.repoUrl ?? "",
      blocks: serializeBlocks(p.variants ?? [], variantFor(p.id, p.activeVariantId ?? "")),
    })),
    achievements: achievements.filter((a) => !hidden.has(a.id)).map((a) => ({
      title: a.title,
      type: a.type,
      date: a.date ?? "",
      issuingBody: a.issuingBody ?? "",
      blocks: serializeBlocks(a.variants, variantFor(a.id, a.activeVariantId)),
    })),
  }
}
