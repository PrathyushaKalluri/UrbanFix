export type ExpertListing = {
  expertId: number
  userId: number
  fullName: string
  primaryExpertise: string
  yearsOfExperience: number
  bio: string | null
  available: boolean
  servesAsResident: boolean
  expertiseAreas: string[]
}