import type { ExpertListing } from '../types/expert'

const EXPERT_CATALOG_ENDPOINT = '/api/experts/all'

export type ExpertCatalogQuery = {
  query?: string
  limit?: number
  signal?: AbortSignal
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function scoreExpert(expert: ExpertListing, query: string) {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return 1
  }

  const searchableText = [
    expert.fullName,
    expert.primaryExpertise,
    expert.bio ?? '',
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

export function rankExperts(experts: ExpertListing[], query = '', limit?: number) {
  const normalizedQuery = normalizeText(query)

  const rankedExperts = [...experts]
    .map((expert) => ({
      expert,
      score: scoreExpert(expert, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.expert.fullName.localeCompare(right.expert.fullName))
    .map(({ expert }) => expert)

  if (!normalizedQuery) {
    return typeof limit === 'number' ? rankedExperts.slice(0, limit) : rankedExperts
  }

  return typeof limit === 'number' ? rankedExperts.slice(0, limit) : rankedExperts
}

export async function fetchExpertCatalog({ query, limit, signal }: ExpertCatalogQuery = {}) {
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

  return rankExperts(experts, query, limit)
}