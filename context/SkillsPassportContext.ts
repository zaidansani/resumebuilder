import type { LearnerInfo, SkillsPassport } from "@/types/resume"
import { createContext } from "react"

export interface SkillsPassportContextValue {
  passport: SkillsPassport
  setPassport: (passport: SkillsPassport) => void
  updateLearnerInfo: (patch: Partial<LearnerInfo>) => void
  exportJSON: () => void
  reset: () => void
}

export const SkillsPassportContext =
  createContext<SkillsPassportContextValue | null>(null)
