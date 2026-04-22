import type { ExpertListing } from "../types/expert";
import { HYDERABAD_AREAS } from "../config/hyderabadAreas";

const EXPERT_CATALOG_ENDPOINT = "/api/experts/all";
const MATCHING_RECOMMENDATIONS_ENDPOINT = "/api/matching/recommendations";

export type ExpertCatalogQuery = {
    query?: string;
    limit?: number;
    latitude?: number;
    longitude?: number;
    signal?: AbortSignal;
};

type MatchingRequest = {
    problemText: string;
    topN?: number;
    latitude?: number;
    longitude?: number;
};

type MatchingSuggestion = {
    expertId: number;
};

type MatchingResponse = {
    suggestions: MatchingSuggestion[];
};

function normalizeExpertListing(expert: Partial<ExpertListing> & Record<string, unknown>): ExpertListing {
    const parseBoolean = (value: unknown) => {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }

        if (typeof value === 'number') {
            return value !== 0;
        }

        return false;
    };

    return {
        expertId: Number(expert.expertId ?? expert.expert_id ?? 0),
        userId: Number(expert.userId ?? expert.user_id ?? 0),
        fullName: String(expert.fullName ?? expert.full_name ?? ''),
        primaryExpertise: String(expert.primaryExpertise ?? expert.primary_expertise ?? ''),
        yearsOfExperience: Number(expert.yearsOfExperience ?? expert.years_of_experience ?? 0),
        available: parseBoolean(expert.available ?? expert.is_available ?? false),
        serviceArea: (expert.serviceArea ?? expert.service_area ?? null) as string | null,
        latitude: (expert.latitude ?? null) as number | null,
        longitude: (expert.longitude ?? null) as number | null,
        expertiseAreas: Array.isArray(expert.expertiseAreas)
            ? expert.expertiseAreas
                .filter((item): item is string => typeof item === 'string')
            : Array.isArray(expert.expertise_areas)
                ? expert.expertise_areas.filter((item): item is string => typeof item === 'string')
                : [],
    };
}

function normalizeText(value: string) {
    return value.trim().toLowerCase();
}

function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === "AbortError";
}

function isValidCoordinate(latitude?: number, longitude?: number) {
    return (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
    );
}

function toRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
}

function calculateDistanceKm(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
) {
    const earthRadiusKm = 6371;
    const deltaLatitude = toRadians(toLatitude - fromLatitude);
    const deltaLongitude = toRadians(toLongitude - fromLongitude);

    const sinLatitude = Math.sin(deltaLatitude / 2);
    const sinLongitude = Math.sin(deltaLongitude / 2);

    const a =
        sinLatitude * sinLatitude +
        Math.cos(toRadians(fromLatitude)) *
            Math.cos(toRadians(toLatitude)) *
            sinLongitude *
            sinLongitude;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

function getExpertDistanceKm(
    expert: ExpertListing,
    latitude?: number,
    longitude?: number,
) {
    if (!isValidCoordinate(latitude, longitude)) {
        return null;
    }

    if (
        !isValidCoordinate(
            expert.latitude ?? undefined,
            expert.longitude ?? undefined,
        )
    ) {
        return null;
    }

    return calculateDistanceKm(
        latitude!,
        longitude!,
        expert.latitude as number,
        expert.longitude as number,
    );
}

function scoreDistance(
    expert: ExpertListing,
    latitude?: number,
    longitude?: number,
) {
    const distanceKm = getExpertDistanceKm(expert, latitude, longitude);
    if (distanceKm === null) {
        return 0;
    }

    if (distanceKm <= 3) {
        return 45;
    }

    if (distanceKm <= 10) {
        return 30;
    }

    if (distanceKm <= 25) {
        return 15;
    }

    return 0;
}

function narrowNearbyExperts(
    expertsWithScore: Array<{
        expert: ExpertListing;
        score: number;
        distanceKm: number | null;
    }>,
    latitude?: number,
    longitude?: number,
) {
    if (!isValidCoordinate(latitude, longitude)) {
        return expertsWithScore;
    }

    const nearestAreaNames = HYDERABAD_AREAS.map((area) => ({
        name: area.name,
        distanceKm: calculateDistanceKm(
            latitude!,
            longitude!,
            area.latitude,
            area.longitude,
        ),
    }))
        .sort((left, right) => left.distanceKm - right.distanceKm)
        .slice(0, 4)
        .map((area) => area.name);

    const relevantAreas = new Set(nearestAreaNames);

    const expertsInRelevantAreas = expertsWithScore.filter(({ expert }) =>
        expert.serviceArea ? relevantAreas.has(expert.serviceArea) : false,
    );

    if (expertsInRelevantAreas.length > 0) {
        return expertsInRelevantAreas;
    }

    const nearbyExperts = expertsWithScore.filter(
        ({ distanceKm }) => distanceKm !== null && distanceKm <= 20,
    );

    const nearbyAreaExperts = nearbyExperts.filter(({ expert }) =>
        Boolean(expert.serviceArea),
    );

    if (nearbyAreaExperts.length >= 3) {
        return nearbyAreaExperts;
    }

    if (nearbyExperts.length >= 3) {
        return nearbyExperts;
    }

    return expertsWithScore;
}

function scoreExpert(expert: ExpertListing, query: string) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return 1;
    }

    const searchableText = [
        expert.fullName,
        expert.primaryExpertise,
        ...expert.expertiseAreas,
    ]
        .join(" ")
        .toLowerCase();

    if (searchableText.includes(normalizedQuery)) {
        return 100;
    }

    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
    if (queryTerms.length === 0) {
        return 1;
    }

    return queryTerms.reduce(
        (total, term) => total + (searchableText.includes(term) ? 10 : 0),
        0,
    );
}

export function rankExperts(
    experts: ExpertListing[],
    query = "",
    limit?: number,
    latitude?: number,
    longitude?: number,
) {
    const normalizedQuery = normalizeText(query);

    const expertsWithScore = [...experts]
        .map((expert) => ({
            expert,
            distanceKm: getExpertDistanceKm(expert, latitude, longitude),
            score:
                scoreExpert(expert, normalizedQuery) +
                scoreDistance(expert, latitude, longitude),
        }))
        .filter(({ score }) => score > 0)
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score;
            }

            if (
                left.distanceKm !== null &&
                right.distanceKm !== null &&
                left.distanceKm !== right.distanceKm
            ) {
                return left.distanceKm - right.distanceKm;
            }

            if (left.distanceKm !== null && right.distanceKm === null) {
                return -1;
            }

            if (left.distanceKm === null && right.distanceKm !== null) {
                return 1;
            }

            return left.expert.fullName.localeCompare(right.expert.fullName);
        });

    const narrowedExperts = narrowNearbyExperts(
        expertsWithScore,
        latitude,
        longitude,
    );

    const rankedExperts = narrowedExperts.map(({ expert }) => expert);

    if (!normalizedQuery) {
        return typeof limit === "number"
            ? rankedExperts.slice(0, limit)
            : rankedExperts;
    }

    return typeof limit === "number"
        ? rankedExperts.slice(0, limit)
        : rankedExperts;
}

const EXPERT_SEARCH_ENDPOINT = "/api/experts/search";

export async function fetchExpertCatalog({
    query,
    limit,
    latitude,
    longitude,
    signal,
}: ExpertCatalogQuery = {}) {
    const normalizedQuery = query?.trim() ?? "";
    const token = localStorage.getItem("authToken");

    if (normalizedQuery) {
        const payload: MatchingRequest = {
            problemText: normalizedQuery,
        };

        if (typeof limit === "number") {
            payload.topN = limit;
        }

        if (isValidCoordinate(latitude, longitude)) {
            payload.latitude = latitude;
            payload.longitude = longitude;
        }

        const response = await fetch(MATCHING_RECOMMENDATIONS_ENDPOINT, {
            method: "POST",
            signal,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Unable to load matching recommendations (${response.status})`);
        }

        const data = (await response.json()) as MatchingResponse;
        const suggestions = Array.isArray(data.suggestions)
            ? data.suggestions.map((expert) => normalizeExpertListing(expert as unknown as Partial<ExpertListing>))
            : [];

        if (suggestions.length > 0) {
            return suggestions;
        }
    }

    const url = new URL(EXPERT_SEARCH_ENDPOINT, window.location.origin);
    const pageSize = limit ?? 20;
    url.searchParams.set("pageSize", pageSize.toString());
    if (normalizedQuery) {
        url.searchParams.set("search", normalizedQuery);
        url.searchParams.set("availableOnly", "true");
    }
    
    if (isValidCoordinate(latitude, longitude)) {
        url.searchParams.set("latitude", latitude!.toString());
        url.searchParams.set("longitude", longitude!.toString());
    }

    const response = await fetch(url.toString(), {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error("The expert directory is temporarily unavailable for this session.");
        }
        if (response.status === 404) {
            throw new Error("The expert directory endpoint is not available yet.");
        }
        throw new Error(`Unable to load experts (${response.status})`);
    }

    const data = await response.json();
    const experts = Array.isArray(data.items)
        ? data.items.map((expert: Partial<ExpertListing> & Record<string, unknown>) => normalizeExpertListing(expert))
        : [];
    
    return rankExperts(experts, normalizedQuery, limit, latitude, longitude);
}
