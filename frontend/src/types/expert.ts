export type ExpertListing = {
  expertId: number
  userId: number
  fullName: string
  primaryExpertise: string
  yearsOfExperience: number
  available: boolean
  serviceArea: string | null
  latitude: number | null
  longitude: number | null
  expertiseAreas: string[]
}