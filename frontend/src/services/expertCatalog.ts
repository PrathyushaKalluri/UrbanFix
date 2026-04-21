import type { ExpertListing } from '../types/expert'
import { HYDERABAD_AREAS } from '../config/hyderabadAreas'

const EXPERT_CATALOG_ENDPOINT = '/api/experts/all'

export type ExpertCatalogQuery = {
  query?: string
  limit?: number
  latitude?: number
  longitude?: number
  signal?: AbortSignal
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function isValidCoordinate(latitude?: number, longitude?: number) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  )
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function calculateDistanceKm(fromLatitude: number, fromLongitude: number, toLatitude: number, toLongitude: number) {
  const earthRadiusKm = 6371
  const deltaLatitude = toRadians(toLatitude - fromLatitude)
  const deltaLongitude = toRadians(toLongitude - fromLongitude)

  const sinLatitude = Math.sin(deltaLatitude / 2)
  const sinLongitude = Math.sin(deltaLongitude / 2)

  const a =
    sinLatitude * sinLatitude +
    Math.cos(toRadians(fromLatitude)) * Math.cos(toRadians(toLatitude)) * sinLongitude * sinLongitude

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

function getExpertDistanceKm(expert: ExpertListing, latitude?: number, longitude?: number) {
  if (!isValidCoordinate(latitude, longitude)) {
    return null
  }

  if (!isValidCoordinate(expert.latitude ?? undefined, expert.longitude ?? undefined)) {
    return null
  }

  return calculateDistanceKm(latitude, longitude, expert.latitude as number, expert.longitude as number)
}

function scoreDistance(
  expert: ExpertListing,
  latitude?: number,
  longitude?: number,
) {
  const distanceKm = getExpertDistanceKm(expert, latitude, longitude)
  if (distanceKm === null) {
    return 0
  }

  if (distanceKm <= 3) {
    return 45
  }

  if (distanceKm <= 10) {
    return 30
  }

  if (distanceKm <= 25) {
    return 15
  }

  return 0
}

function narrowNearbyExperts(
  expertsWithScore: Array<{ expert: ExpertListing; score: number; distanceKm: number | null }>,
  latitude?: number,
  longitude?: number,
) {
  if (!isValidCoordinate(latitude, longitude)) {
    return expertsWithScore
  }

  const nearestAreaNames = HYDERABAD_AREAS
    .map((area) => ({
      name: area.name,
      distanceKm: calculateDistanceKm(latitude, longitude, area.latitude, area.longitude),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 4)
    .map((area) => area.name)

  const relevantAreas = new Set(nearestAreaNames)

  const expertsInRelevantAreas = expertsWithScore.filter(({ expert }) =>
    expert.serviceArea ? relevantAreas.has(expert.serviceArea) : false,
  )

  if (expertsInRelevantAreas.length > 0) {
    return expertsInRelevantAreas
  }

  const nearbyExperts = expertsWithScore.filter(({ distanceKm }) => distanceKm !== null && distanceKm <= 20)

  const nearbyAreaExperts = nearbyExperts.filter(({ expert }) => Boolean(expert.serviceArea))

  if (nearbyAreaExperts.length >= 3) {
    return nearbyAreaExperts
  }

  if (nearbyExperts.length >= 3) {
    return nearbyExperts
  }

  return expertsWithScore
}

function scoreExpert(expert: ExpertListing, query: string) {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return 1
  }

  const searchableText = [
    expert.fullName,
    expert.primaryExpertise,
    ...expert.expertiseAreas,
  ]
    .join(' ')
    .toLowerCase()

  if (searchableText.includes(normalizedQuery)) {
    return 100
  }

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean)
  if (queryTerms.length === 0) {
    return 1
  }

  return queryTerms.reduce((total, term) => total + (searchableText.includes(term) ? 10 : 0), 0)
}

export function rankExperts(experts: ExpertListing[], query = '', limit?: number, latitude?: number, longitude?: number) {
  const normalizedQuery = normalizeText(query)

  const expertsWithScore = [...experts]
    .map((expert) => ({
      expert,
      distanceKm: getExpertDistanceKm(expert, latitude, longitude),
      score: scoreExpert(expert, normalizedQuery) + scoreDistance(expert, latitude, longitude),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      if (left.distanceKm !== null && right.distanceKm !== null && left.distanceKm !== right.distanceKm) {
        return left.distanceKm - right.distanceKm
      }

      if (left.distanceKm !== null && right.distanceKm === null) {
        return -1
      }

      if (left.distanceKm === null && right.distanceKm !== null) {
        return 1
      }

      return left.expert.fullName.localeCompare(right.expert.fullName)
    })

  const narrowedExperts = narrowNearbyExperts(expertsWithScore, latitude, longitude)

  const rankedExperts = narrowedExperts
    .map(({ expert }) => expert)

  if (!normalizedQuery) {
    return typeof limit === 'number' ? rankedExperts.slice(0, limit) : rankedExperts
  }

  return typeof limit === 'number' ? rankedExperts.slice(0, limit) : rankedExperts
}

export async function fetchExpertCatalog({ query, limit, latitude, longitude, signal }: ExpertCatalogQuery = {}) {
  const token = localStorage.getItem('authToken')

  const response = await fetch(EXPERT_CATALOG_ENDPOINT, {
    signal,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('The expert directory is temporarily unavailable for this session.')
    }

    if (response.status === 404) {
      throw new Error('The expert directory endpoint is not available yet.')
    }

    throw new Error(`Unable to load experts (${response.status})`)
  }

  const experts = (await response.json()) as ExpertListing[]

  return rankExperts(experts, query, limit, latitude, longitude)
}