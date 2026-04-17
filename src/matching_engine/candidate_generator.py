from __future__ import annotations

from typing import Iterable, List

from .geo import haversine_km
from .models import Candidate, ExpertProfile, ProblemInput


class CandidateGenerator:
    def generate(
        self,
        problem: ProblemInput,
        experts: Iterable[ExpertProfile],
    ) -> List[Candidate]:
        required = {skill.lower() for skill in problem.required_skills}
        candidates: List[Candidate] = []

        for expert in experts:
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
