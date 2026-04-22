// ============================================================
// Europass CV — Resolved Type Definitions
// Derived from storage types after collapsing variants.
// Clean, XML-conformable, no UI/storage concerns.
// ============================================================

import type {
  Achievement,
  AwardingBody,
  ContentBlock,
  DocumentMetadata,
  Employer,
  EQFLevel,
  Identification,
  Label,
  Period,
  Project,
  Publication,
  Reference,
  Skills,
  VolunteerActivity,
} from "@/types/resume"

// ------------------------------------------------------------
// Resolved Entries — variants collapsed to active content
// ------------------------------------------------------------

export interface ResolvedWorkExperience {
  period: Period
  employer: Employer
  position: Label
  content: ContentBlock[]
}

export interface ResolvedEducationEntry {
  period: Period
  title: string
  type?: string
  awardingBody: AwardingBody
  field?: Label
  eqfLevel?: EQFLevel
  grade?: string
  content: ContentBlock[]
}

// ------------------------------------------------------------
// Resolved LearnerInfo
// ------------------------------------------------------------

export interface ResolvedLearnerInfo {
  identification: Identification
  workExperience: ResolvedWorkExperience[]
  education: ResolvedEducationEntry[]
  skills: Skills
  achievements: Achievement[]
  publications: Publication[]
  projects: Project[]
  volunteering: VolunteerActivity[]
  references: Reference[]
  coverLetter?: string
}

// ------------------------------------------------------------
// EuropassDocument — top-level resolved root
// Serializable directly to Europass XML
// ------------------------------------------------------------

export interface EuropassDocument {
  metadata: DocumentMetadata
  learnerInfo: ResolvedLearnerInfo
}
