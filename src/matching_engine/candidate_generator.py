from __future__ import annotations

from typing import Iterable, List, Literal, Sequence

from .geo import bounding_box, haversine_km, is_within_bounding_box
from .models import Candidate, ExpertProfile, ProblemInput
from .spatial_index import ExpertSpatialIndex, build_spatial_index


class CandidateGenerator:
    def __init__(
        self,
        auto_index_threshold: int = 2000,
        spatial_index_backend: Literal["auto", "sorted-latitude", "quadtree"] = "auto",
    ) -> None:
        self._auto_index_threshold = auto_index_threshold
        self._spatial_index_backend = spatial_index_backend
        self._cached_experts_ref: Sequence[ExpertProfile] | None = None
        self._cached_spatial_index: ExpertSpatialIndex | None = None

    def generate(
        self,
        problem: ProblemInput,
        experts: Iterable[ExpertProfile],
    ) -> List[Candidate]:
        required = {skill.lower() for skill in problem.required_skills}
        candidates: List[Candidate] = []
        nearby = self._nearby_experts(problem, experts)

        for expert in nearby:
            expert_skills = {skill.lower() for skill in expert.skills}
            overlap = len(required.intersection(expert_skills))
            if overlap == 0:
                continue

            distance_km = haversine_km(problem.location, expert.location)
            if distance_km > problem.max_radius_km:
                continue

            candidates.append(
                Candidate(
                    expert=expert,
                    distance_km=distance_km,
                    skill_overlap=overlap,
                )
            )

        return candidates

    def _nearby_experts(
        self,
        problem: ProblemInput,
        experts: Iterable[ExpertProfile],
    ) -> Iterable[ExpertProfile]:
        if isinstance(experts, Sequence):
            if self._cached_experts_ref is not experts:
                self._cached_experts_ref = experts
                self._cached_spatial_index = build_spatial_index(
                    experts,
                    backend=self._spatial_index_backend,
                    threshold=self._auto_index_threshold,
                )

            if self._cached_spatial_index is not None:
                return self._cached_spatial_index.query_within_radius(
                    problem.location,
                    problem.max_radius_km,
                )

        box = bounding_box(problem.location, problem.max_radius_km)
        return [expert for expert in experts if is_within_bounding_box(expert.location, box)]
