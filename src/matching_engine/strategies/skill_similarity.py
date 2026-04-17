from __future__ import annotations

from typing import Dict

from .base import ScoringStrategy
from ..models import Candidate, ProblemInput


class SkillSimilarityStrategy(ScoringStrategy):
    @property
    def name(self) -> str:
        return "skill"

    def score(
        self,
        problem: ProblemInput,
        candidate: Candidate,
        context: Dict[str, object],
    ) -> float:
        required = {skill.lower() for skill in problem.required_skills}
        offered = {skill.lower() for skill in candidate.expert.skills}

        if not required and not offered:
            return 1.0

        union = required.union(offered)
        intersection = required.intersection(offered)
        jaccard = len(intersection) / len(union) if union else 0.0

        weighted_categories = context.get("weighted_categories", {})
        category_affinity = 0.0
        if isinstance(weighted_categories, dict) and weighted_categories:
            expert_categories = {c.lower() for c in candidate.expert.categories}
            category_affinity = sum(
                weight
                for category, weight in weighted_categories.items()
                if category.lower() in expert_categories
            )

        blended = (0.8 * jaccard) + (0.2 * category_affinity)
        return self.clamp(blended)
