// ============================================================
// Europass CV — Storage Type Definitions
// Persisted to DB / localStorage. Contains UI/storage concerns
// (variants, internal IDs). Not directly XML-conformable.
// ============================================================

// ------------------------------------------------------------
// Primitives & Shared
// ------------------------------------------------------------

/** ISO 8601 date string: "YYYY-MM-DD" or partial "YYYY-MM" / "YYYY" */
export type ISODate = string

export interface Period {
  from: ISODate
  /** Omit for "present" / ongoing */
  to?: ISODate
  current?: boolean
}

export interface Label {
  code?: string
  label: string
}

export interface Website {
  url: string
  label?: string
}

// ------------------------------------------------------------
// Content Blocks — discriminated union
// ------------------------------------------------------------

export interface BulletBlock {
  type: "bullets"
  heading?: string
  items: string[]
}

export interface ParagraphBlock {
  type: "paragraph"
  heading?: string
  body: string
}

export interface MetricBlock {
  type: "metric"
  heading?: string
  items: { label: string; value: string }[]
}

export interface TagsBlock {
  type: "tags"
  heading?: string
  tags: string[]
}

export interface KeyValueBlock {
  type: "keyvalue"
  heading?: string
  pairs: { key: string; value: string }[]
}

export type ContentBlock =
  | BulletBlock
  | ParagraphBlock
  | MetricBlock
  | TagsBlock
  | KeyValueBlock

// ------------------------------------------------------------
// Content Variants
// ------------------------------------------------------------

export interface ContentVariant {
  id: string
  /** Human-readable label e.g. "Backend Role", "Research Position" */
  label: string
  content: ContentBlock[]
}

// ------------------------------------------------------------
// Personal Identification
// ------------------------------------------------------------

export interface PersonName {
  firstName: string
  surname: string
  /** e.g. "Dr.", "Prof." */
  title?: string
}

export interface Address {
  addressLine?: string
  municipality?: string
  postalCode?: string
  country?: Label
}

export type PhoneType = "mobile" | "home" | "work" | "fax"

export interface PhoneContact {
  type: PhoneType
  number: string
}

export interface InstantMessaging {
  /** e.g. "LinkedIn", "GitHub", "Skype" */
  platform: string
  handle: string
  url?: string
}

export interface ContactInfo {
  address?: Address
  email?: string
  phone?: PhoneContact[]
  website?: Website[]
  github?: string
  linkedin?: string
  instantMessaging?: InstantMessaging[]
}

export interface Demographics {
  dateOfBirth?: ISODate
  /** ISO 3166-1 alpha-2 */
  nationality?: Label[]
  gender?: "male" | "female" | "other" | "preferNotToSay"
}

export interface Identification {
  personName: PersonName
  contact: ContactInfo
  demographics?: Demographics
  /** Base64 encoded image or URL */
  photo?: string
}

// ------------------------------------------------------------
// Work Experience
// ------------------------------------------------------------

export interface Employer {
  name: string
  sector?: Label
  website?: string
  address?: Address
}

export interface WorkExperience {
  id: string
  period: Period
  employer: Employer
  position: Label
  /** All saved content variants for this entry */
  variants: ContentVariant[]
  /** ID of the currently selected variant */
  activeVariantId: string
}

// ------------------------------------------------------------
// Education & Training
// ------------------------------------------------------------

export type EQFLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface AwardingBody {
  name: string
  website?: string
  address?: Address
}

export interface EducationEntry {
  id: string
  period: Period
  title: string
  /** e.g. "Bachelor of Science", "Master of Science" */
  type?: string
  awardingBody: AwardingBody
  field?: Label
  /** European Qualifications Framework level */
  eqfLevel?: EQFLevel
  grade?: string
  /** All saved content variants for this entry */
  variants: ContentVariant[]
  /** ID of the currently selected variant */
  activeVariantId: string
}

// ------------------------------------------------------------
// Skills
// ------------------------------------------------------------

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "native"

export interface LanguageSkill {
  language: Label
  listening: CEFRLevel
  reading: CEFRLevel
  spokenInteraction: CEFRLevel
  spokenProduction: CEFRLevel
  writing: CEFRLevel
  certificate?: string
}

export type DigitalProficiency = "basic" | "independent" | "proficient"

export interface DigitalSkillArea {
  /** EU DigComp areas: information, communication, contentCreation, safety, problemSolving */
  area: string
  level: DigitalProficiency
}

export interface DigitalSkill {
  tools?: string[]
  competences?: DigitalSkillArea[]
}

export interface SkillEntry {
  id: string
  label: string
  /** e.g. "programming", "soft", "domain" */
  category?: string
  /** 1–5 self-assessed proficiency */
  proficiency?: 1 | 2 | 3 | 4 | 5
  yearsOfExperience?: number
}

export interface Skills {
  languages: LanguageSkill[]
  digital?: DigitalSkill
  other: SkillEntry[]
}

// ------------------------------------------------------------
// Achievements & Publications
// ------------------------------------------------------------

export interface Achievement {
  id: string
  type: "award" | "honour" | "scholarship" | "certification" | "other"
  title: string
  date?: ISODate
  issuingBody?: string
  url?: string
  variants: ContentVariant[]
  activeVariantId: string
}

export interface Publication {
  id: string
  title: string
  type: "article" | "book" | "conference" | "thesis" | "report" | "other"
  authors?: string[]
  date?: ISODate
  publisher?: string
  doi?: string
  url?: string
}

// ------------------------------------------------------------
// Projects
// ------------------------------------------------------------

export interface Project {
  id: string
  title: string
  period?: Period
  role?: string
  description?: string
  technologies?: string[]
  url?: string
  repoUrl?: string
  variants: ContentVariant[]
  activeVariantId: string
}

// ------------------------------------------------------------
// Volunteering
// ------------------------------------------------------------

export interface VolunteerActivity {
  id: string
  period: Period
  organisation: string
  role: string
  description?: string
}

// ------------------------------------------------------------
// References
// ------------------------------------------------------------

export interface Reference {
  id: string
  name: string
  position?: string
  organisation?: string
  email?: string
  phone?: string
  relationship?: string
}

// ------------------------------------------------------------
// Variant Profiles
// ------------------------------------------------------------

export interface VariantProfile {
  id: string
  label: string
  /** Entry IDs that are hidden when this profile is active */
  hidden: string[]
  /** Map of entryId → variantId override; missing keys fall back to activeVariantId */
  variantSelections: Record<string, string>
  headline?: string
  about?: string
  /** Section order for this profile; falls back to global order if absent */
  sectionOrder?: string[]
}

// ------------------------------------------------------------
// Document Metadata
// ------------------------------------------------------------

export interface DocumentMetadata {
  lastModified: ISODate
  /** BCP 47 locale e.g. "en-GB", "fr-FR" */
  locale: string
  xsdVersion?: string
  template?: string
  visibleSections?: (keyof LearnerInfo)[]
}

// ------------------------------------------------------------
// Root: LearnerInfo & SkillsPassport
// ------------------------------------------------------------

export interface LearnerInfo {
  identification: Identification
  workExperience: WorkExperience[]
  education: EducationEntry[]
  skills: Skills
  achievements: Achievement[]
  publications: Publication[]
  projects: Project[]
  volunteering: VolunteerActivity[]
  references: Reference[]
  coverLetter?: string
  profiles?: VariantProfile[]
  activeProfileId?: string
}

/** Top-level storage root — persisted to DB / localStorage */
export interface SkillsPassport {
  metadata: DocumentMetadata
  learnerInfo: LearnerInfo
}
