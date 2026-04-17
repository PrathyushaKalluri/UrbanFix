from __future__ import annotations

import re
from collections import Counter
from typing import Dict

from .models import ClassificationResult


class KeywordMultiLabelClassifier:
    """Simple weighted multi-label classifier designed for easy ML replacement later."""

    def __init__(self, category_keywords: Dict[str, list[str]]) -> None:
        self._category_keywords = {
            category.lower(): [kw.lower() for kw in keywords]
            for category, keywords in category_keywords.items()
        }

    def classify(self, free_text_problem: str) -> ClassificationResult:
        tokens = self._tokenize(free_text_problem)
        counts = Counter(tokens)

        raw_scores: Dict[str, float] = {}
        for category, keywords in self._category_keywords.items():
            score = 0.0
            for keyword in keywords:
                score += counts[keyword]
            if score > 0:
                raw_scores[category] = score

        if not raw_scores:
            return ClassificationResult(weighted_categories={})

        score_sum = sum(raw_scores.values())
        weighted = {category: score / score_sum for category, score in raw_scores.items()}
        return ClassificationResult(weighted_categories=weighted)

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return re.findall(r"[a-zA-Z0-9-]+", text.lower())
