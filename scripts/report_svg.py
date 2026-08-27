#!/usr/bin/env python3
"""Create a compact vertical SVG result card without a section diagram."""

from __future__ import annotations

import argparse
import html
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from selector import TABLES, select


def esc(value: object) -> str:
    return html.escape(str(value))


def num(value: float) -> str:
    return str(int(value)) if value.is_integer() else f"{value:g}"


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--floor", choices=TABLES, required=True)
    p.add_argument("--basis", choices=("finish", "joist"), required=True)
    p.add_argument("--height-min", type=float, required=True)
    p.add_argument("--height-max", type=float)
    p.add_argument("--finish-thickness", type=float, default=0)
    p.add_argument("--underlayment", type=float, action="append", default=[])
    p.add_argument("--site", required=True)
    p.add_argument("--output", required=True)
    args = p.parse_args()
    data = select(floor=args.floor, basis=args.basis, height_min=args.height_min,
                  height_max=args.height_max, finish_thickness=args.finish_thickness,
                  underlayments=args.underlayment, limit=3)
    now = datetime.now(ZoneInfo("Asia/Tokyo"))
    title_product = "GTフロアー" if args.floor.startswith("gt-floor") else "GTダイレクト"
    candidates = data["candidates"]
    if candidates:
        first = candidates[0]
        hero = f"スタンド H{first['stand']} + ボルト組 L{first['bolt']}"
        official = f"公式調整範囲 {first['minimum']}～{first['maximum']} mm"
    else:
        hero = "適合候補なし"
        official = "公式表範囲外・メーカー確認"
    rows = []
    for i, c in enumerate(candidates, 1):
        y = 880 + (i - 1) * 100
        rows.append(f'<text x="85" y="{y}" class="rank">{i}</text><text x="155" y="{y}" class="candidate">H{c["stand"]}+L{c["bolt"]}</text><text x="690" y="{y}" class="range">{c["minimum"]}～{c["maximum"]}</text>')
    if not rows:
        rows.append('<text x="85" y="880" class="candidate">範囲全体を満たす候補はありません</text>')
    input_range = f"{num(data['input_min'])}～{num(data['input_max'])} mm"
    joist_range = f"{num(data['joist_min'])}～{num(data['joist_max'])} mm"
    if args.basis == "finish":
        layers = " + ".join(num(float(x)) for x in [args.finish_thickness, *args.underlayment])
        calc = f"{input_range.replace(' mm','')} - ({layers}) = {joist_range}"
        basis_label = "仕上げ天端"
    else:
        calc = f"入力値を根太上高さとして照合 = {joist_range}"
        basis_label = "根太上高さ"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1260" viewBox="0 0 1080 1260">
<style>
text{{font-family:"Yu Gothic","Noto Sans JP",sans-serif}} .title{{font-size:56px;font-weight:700;fill:#fff}} .sub{{font-size:29px;font-weight:600;fill:#082558}}
.hero{{font-size:52px;font-weight:700;fill:#007c78}} .official{{font-size:38px;font-weight:700;fill:#007c78}} .head{{font-size:29px;font-weight:700;fill:#fff}}
.label{{font-size:27px;font-weight:700;fill:#17223b}} .value{{font-size:27px;fill:#17223b}} .rank{{font-size:42px;font-weight:700;fill:#007c78}}
.candidate{{font-size:34px;font-weight:700;fill:#17223b}} .range{{font-size:30px;font-weight:700;fill:#007c78}} .meta{{font-size:22px;fill:#53606f}}
</style>
<rect width="1080" height="1260" fill="#f6f8fb"/><rect x="20" y="20" width="1040" height="110" rx="16" fill="#05245c"/>
<text x="55" y="92" class="title">{esc(title_product)} 支持台・ボルト選定結果</text>
<text x="55" y="178" class="sub">現場名：{esc(args.site)}　｜　{esc(data['floor_name'])}</text><line x1="40" y1="205" x2="1040" y2="205" stroke="#05245c" stroke-width="3"/>
<rect x="40" y="238" width="1000" height="150" rx="12" fill="#fff" stroke="#007c78" stroke-width="4"/><rect x="40" y="238" width="190" height="150" rx="12" fill="#007c78"/>
<text x="85" y="329" class="title">推奨</text><text x="260" y="326" class="hero">{esc(hero)}</text>
<rect x="40" y="410" width="1000" height="82" rx="12" fill="#fff" stroke="#007c78" stroke-width="3"/><text x="540" y="464" class="official" text-anchor="middle">{esc(official)}</text>
<rect x="40" y="520" width="1000" height="54" rx="8" fill="#05245c"/><text x="540" y="557" text-anchor="middle" class="head">入力条件・計算</text>
<rect x="40" y="574" width="1000" height="164" fill="#fff" stroke="#c6cfdd"/><text x="70" y="622" class="label">入力基準</text><text x="310" y="622" class="value">{esc(basis_label)}</text>
<text x="70" y="670" class="label">入力範囲</text><text x="310" y="670" class="value">{esc(input_range)}</text><text x="70" y="718" class="label">計算</text><text x="310" y="718" class="value">{esc(calc)}</text>
<rect x="40" y="760" width="1000" height="54" rx="8" fill="#05245c"/><text x="540" y="797" text-anchor="middle" class="head">適合候補（上位3件）</text>
{''.join(rows)}
<text x="55" y="1195" class="meta">KIRII公式資料：STEEL FLOOR Ver.202602</text><text x="1025" y="1195" class="meta" text-anchor="end">保存日時：{now:%Y/%m/%d %H:%M}</text>
<text x="55" y="1232" class="meta">KIRII</text>
</svg>'''
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(svg, encoding="utf-8")
    print(output.resolve())


if __name__ == "__main__":
    main()
