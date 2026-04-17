from __future__ import annotations

import argparse
import random
import statistics
import sys
import time
from pathlib import Path
from typing import List

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from matching_engine import Availability, ExpertProfile, Location, ProblemInput, build_default_engine


def percentile(samples: List[float], q: float) -> float:
    if not samples:
        return 0.0
    ordered = sorted(samples)
    rank = (len(ordered) - 1) * q
    low = int(rank)
    high = min(low + 1, len(ordered) - 1)
    weight = rank - low
    return ordered[low] * (1.0 - weight) + ordered[high] * weight


def random_expert(idx: int, lat_center: float, lon_center: float, spread: float) -> ExpertProfile:
    skills_pool = [
        "plumbing",
        "pipe repair",
        "leak detection",
        "electrical",
        "switch install",
        "painting",
        "wall coating",
        "carpentry",
    ]
    categories_pool = ["plumbing", "electrical", "painting", "carpentry"]

    return ExpertProfile(
        expert_id=f"exp-{idx:06d}",
        name=f"Expert {idx}",
        skills=random.sample(skills_pool, k=3),
        categories=random.sample(categories_pool, k=2),
        location=Location(
            latitude=lat_center + random.uniform(-spread, spread),
            longitude=lon_center + random.uniform(-spread, spread),
        ),
        experience_years=random.randint(1, 20),
        availability=Availability(
            status="available" if random.random() > 0.2 else "busy",
            next_available_hours=random.randint(0, 72),
        ),
        rating=round(random.uniform(3.5, 5.0), 2),
    )


def random_problem(lat_center: float, lon_center: float) -> ProblemInput:
    skill_sets = [
        ["plumbing", "leak detection"],
        ["electrical", "switch install"],
        ["painting", "wall coating"],
        ["carpentry"],
    ]

    skills = random.choice(skill_sets)
    return ProblemInput(
        text=f"Need urgent help with {' and '.join(skills)}",
        location=Location(
            latitude=lat_center + random.uniform(-0.08, 0.08),
            longitude=lon_center + random.uniform(-0.08, 0.08),
        ),
        required_skills=skills,
        required_experience_years=random.randint(1, 8),
        max_radius_km=random.uniform(5.0, 25.0),
    )


def run_benchmark(args: argparse.Namespace) -> None:
    random.seed(args.seed)

    experts = [
        random_expert(i, lat_center=args.center_lat, lon_center=args.center_lon, spread=args.spread)
        for i in range(args.experts)
    ]

    engine = build_default_engine(
        enable_result_cache=args.cache,
        spatial_index_threshold=args.index_threshold,
        spatial_index_backend=args.index_backend,
    )

    for _ in range(args.warmup):
        problem = random_problem(args.center_lat, args.center_lon)
        engine.match(problem=problem, experts=experts, top_k=args.top_k)

    latencies_ms: List[float] = []
    for _ in range(args.queries):
        problem = random_problem(args.center_lat, args.center_lon)
        start = time.perf_counter()
        engine.match(problem=problem, experts=experts, top_k=args.top_k)
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        latencies_ms.append(elapsed_ms)

    p50 = percentile(latencies_ms, 0.50)
    p95 = percentile(latencies_ms, 0.95)
    p99 = percentile(latencies_ms, 0.99)
    avg = statistics.mean(latencies_ms)

    print("=== UrbanFix Matching Benchmark ===")
    print(f"experts={args.experts}, queries={args.queries}, warmup={args.warmup}")
    print(f"index_backend={args.index_backend}, index_threshold={args.index_threshold}, cache={args.cache}")
    print(f"avg_ms={avg:.2f}")
    print(f"p50_ms={p50:.2f}")
    print(f"p95_ms={p95:.2f}")
    print(f"p99_ms={p99:.2f}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark matching latency with synthetic load")
    parser.add_argument("--experts", type=int, default=20000)
    parser.add_argument("--queries", type=int, default=1000)
    parser.add_argument("--warmup", type=int, default=100)
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--index-backend", choices=["auto", "sorted-latitude", "quadtree"], default="quadtree")
    parser.add_argument("--index-threshold", type=int, default=2000)
    parser.add_argument("--cache", action="store_true", help="Enable result cache")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--center-lat", type=float, default=40.7128)
    parser.add_argument("--center-lon", type=float, default=-74.0060)
    parser.add_argument("--spread", type=float, default=0.8, help="Degree spread for synthetic experts")
    return parser.parse_args()


if __name__ == "__main__":
    run_benchmark(parse_args())
