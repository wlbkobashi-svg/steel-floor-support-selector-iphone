#!/usr/bin/env python3
"""Deterministic KIRII steel-floor stand/bolt selector."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class Candidate:
    stand: int
    bolt: int
    minimum: int
    maximum: int

    @property
    def label(self) -> str:
        return f"H{self.stand}+L{self.bolt}"

    @property
    def center(self) -> float:
        return (self.minimum + self.maximum) / 2


def rows(data: dict[int, dict[int, tuple[int, int]]]) -> list[Candidate]:
    return [Candidate(h, bolt, limits[0], limits[1]) for bolt, stands in data.items() for h, limits in stands.items()]


GENERAL = rows({
    150: {50:(211,236),100:(255,286),150:(305,336),200:(350,381),300:(450,480)},
    180: {50:(241,266),100:(255,316),150:(305,366),200:(350,411),300:(450,505)},
    200: {50:(261,286),100:(261,336),150:(305,386),200:(350,431),300:(450,530)},
    250: {100:(311,386),150:(311,436),200:(350,481),300:(450,580)},
    300: {100:(361,436),150:(361,486),200:(361,531),300:(450,630)},
    350: {150:(411,536),200:(411,581),300:(450,680)},
    400: {150:(461,586),200:(461,631),300:(461,730)},
    500: {200:(561,731),300:(561,830)},
})

KENDO = rows({
    150: {50:(215,236),100:(265,286),150:(315,336),200:(360,381),300:(460,480)},
    180: {50:(241,266),100:(265,316),150:(315,366),200:(360,411),300:(460,505)},
    200: {50:(261,286),100:(265,336),150:(315,386),200:(360,431),300:(460,530)},
    250: {100:(311,386),150:(315,436),200:(360,481),300:(460,580)},
    300: {100:(361,436),150:(361,486),200:(361,531),300:(460,630)},
    350: {150:(411,536),200:(411,581),300:(460,680)},
    400: {150:(461,586),200:(461,631),300:(461,730)},
    500: {200:(561,731),300:(561,830)},
})

JUDO = rows({
    150: {50:(230,236),100:(280,286),150:(330,336),200:(375,381),300:(475,480)},
    180: {50:(241,266),100:(280,316),150:(330,366),200:(375,411),300:(475,505)},
    200: {50:(261,286),100:(280,336),150:(330,386),200:(375,431),300:(475,530)},
    250: {100:(311,386),150:(330,436),200:(375,481),300:(475,580)},
    300: {100:(361,436),150:(361,486),200:(375,531),300:(475,630)},
    350: {150:(411,536),200:(411,581),300:(475,680)},
    400: {150:(461,586),200:(461,631),300:(475,730)},
    500: {200:(561,731),300:(561,830)},
})

DIRECT = rows({
    150: {50:(211,236),100:(242,286),150:(292,336),200:(337,381),300:(437,480)},
    180: {50:(241,266),100:(242,316),150:(292,366),200:(337,411),300:(437,510)},
    200: {50:(261,286),100:(261,336),150:(292,386),200:(337,431),300:(437,530)},
    250: {100:(311,386),150:(311,436),200:(337,481),300:(437,580)},
    300: {100:(361,436),150:(361,486),200:(361,531),300:(437,630)},
    350: {150:(411,536),200:(411,581),300:(437,680)},
    400: {150:(461,586),200:(461,631),300:(461,730)},
    500: {200:(561,731),300:(561,830)},
})

TABLES = {
    "gt-floor-general": ("GTフロアー 一般体育館", GENERAL),
    "gt-floor-kendo": ("GTフロアー 剣道場", KENDO),
    "gt-floor-judo": ("GTフロアー 柔道場・柔剣道場", JUDO),
    "gt-direct": ("GTダイレクト", DIRECT),
}


def select(*, floor: str, basis: str, height_min: float, height_max: float | None = None,
           finish_thickness: float = 0, underlayments: list[float] | None = None,
           limit: int = 3) -> dict:
    if floor not in TABLES:
        raise ValueError(f"unknown floor: {floor}")
    if basis not in {"finish", "joist"}:
        raise ValueError("basis must be finish or joist")
    high = height_min if height_max is None else height_max
    low, high = sorted((float(height_min), float(high)))
    layers = list(underlayments or [])
    deduction = float(finish_thickness) + sum(layers) if basis == "finish" else 0.0
    if basis == "finish" and (finish_thickness <= 0 or not layers):
        raise ValueError("finish basis requires positive finish thickness and at least one underlayment value")
    joist_low, joist_high = low - deduction, high - deduction
    if joist_low < 0:
        raise ValueError("calculated joist height is negative")
    name, candidates = TABLES[floor]
    target_center = (joist_low + joist_high) / 2
    matches = [c for c in candidates if c.minimum <= joist_low and c.maximum >= joist_high]
    matches.sort(key=lambda c: (abs(c.center-target_center), c.maximum-c.minimum, c.stand, c.bolt))
    return {
        "floor": floor,
        "floor_name": name,
        "basis": basis,
        "input_min": low,
        "input_max": high,
        "finish_thickness": float(finish_thickness),
        "underlayments": layers,
        "deduction": deduction,
        "joist_min": joist_low,
        "joist_max": joist_high,
        "candidates": [asdict(c) | {"label": c.label, "center": c.center} for c in matches[:limit]],
        "catalog_revision": "STEEL FLOOR Ver.202602",
    }


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    p.add_argument("--floor", choices=TABLES, required=True)
    p.add_argument("--basis", choices=("finish", "joist"), required=True)
    p.add_argument("--height-min", type=float, required=True)
    p.add_argument("--height-max", type=float)
    p.add_argument("--finish-thickness", type=float, default=0)
    p.add_argument("--underlayment", type=float, action="append", default=[])
    p.add_argument("--limit", type=int, default=3)
    p.add_argument("--json", action="store_true")
    return p


def compact(n: float) -> str:
    return str(int(n)) if n.is_integer() else f"{n:g}"


def main() -> None:
    args = parser().parse_args()
    result = select(floor=args.floor, basis=args.basis, height_min=args.height_min,
                    height_max=args.height_max, finish_thickness=args.finish_thickness,
                    underlayments=args.underlayment, limit=args.limit)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    print(result["floor_name"])
    print(f"根太上高さ: {compact(result['joist_min'])}～{compact(result['joist_max'])} mm")
    if not result["candidates"]:
        print("適合候補なし（公式表範囲外。メーカー確認）")
        return
    for index, item in enumerate(result["candidates"], 1):
        mark = "推奨" if index == 1 else str(index)
        print(f"{mark}: スタンド H{item['stand']} + ボルト組 L{item['bolt']} / {item['minimum']}～{item['maximum']} mm")


if __name__ == "__main__":
    main()
