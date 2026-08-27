---
name: steel-floor-support-selector
description: Select KIRII steel-floor stand and bolt assemblies for GT Floor sports floors or GT Direct from a point or min-max height, and create a compact branded result image. Use for 鋼製床, GTフロアー, GTダイレクト, 支持台・ボルト組選定, or スタンドH＋ボルト組L. Do not use for Barrierless Floor K/M support legs or another manufacturer.
---

# 鋼製床 支持台・ボルト選定

桐井製作所の公式調整高表を使い、必要な根太上高さの一点または範囲全体を満たす「スタンド H + ボルト組 L」を選定する。

## 最初に整理する入力

- 現場名。未指定なら結果表示前に確認する。
- 床タイプ: `GTフロアー 一般体育館`、`GTフロアー 剣道場`、`GTフロアー 柔道場・柔剣道場`、`GTダイレクト`。
- 高さ基準: 仕上げ天端、または根太上高さ。
- 高さ。一点または最小～最大。`595.602` のような入力は 595～602 mm と解釈する。
- 仕上げ天端基準では、仕上げ材厚、捨張り1、捨張り2（なければ0）。未指定厚を推定しない。

GTフロアーとGTダイレクトを混同しない。バリアレスフロアーの支持脚・K根太表は使わない。

## 計算と選定

1. 仕上げ天端基準では、各端点について `根太上高さ = 仕上げ天端 - 仕上げ材厚 - 捨張り1 - 捨張り2` とする。根太パット、クッションゴム、鋼材寸法を追加控除しない。
2. 現行表と出典を確認する必要がある場合は [公式資料](references/official-sources.md) を読む。内蔵表の詳細を確認する場合は [選定表](references/selection-tables.md) を読む。
3. 一点ならその高さ、範囲なら最小から最大までの全体を単独で包含する候補だけを適合とする。範囲の一部しか覆わない候補を適合にしない。
4. 適合候補を、必要範囲の中心と公式調整範囲の中心との差が小さい順に並べる。同差なら公式範囲が狭い候補、次に H、L の小さい候補を優先する。この順位は作業上の推奨でありメーカー指定順位ではない。
5. 推奨を含む上位3件を示す。該当なしの場合は最寄り品番で代用せず、公式表範囲外として桐井製作所への確認を促す。

決定的な計算には [selector.py](scripts/selector.py) を使う。

```bash
python scripts/selector.py --floor gt-floor-general --basis finish --height-min 595 --height-max 602 --finish-thickness 18 --underlayment 15
python scripts/selector.py --floor gt-direct --basis joist --height-min 562 --height-max 569 --json
```

## 出力

本文では次を簡潔に示す。

- 現場名、床タイプ、入力基準
- 入力値と根太上高さへの計算式
- 推奨: `スタンド H300 + ボルト組 L350`
- 公式調整範囲
- 適合候補 上位3件
- 参照した公式資料の版、ページ、URL
- 施工図、荷重条件、発注可否は別途確認が必要であること

画像を求められたら [画像仕様](references/output-spec.md) に従い、[report_svg.py](scripts/report_svg.py) で縦長SVGを作る。断面構成図と下部注意書きは入れない。保存日時は手入力を求めず、出力直前の日本時間を `YYYY/MM/DD HH:mm` で表示する。

```bash
python scripts/report_svg.py --floor gt-floor-general --basis finish --height-min 595 --height-max 602 --finish-thickness 18 --underlayment 15 --site 事務所 --output result.svg
```

## 更新時の扱い

「最新」「発注」「現行品番」が重要な依頼では、内蔵表だけで確定せず桐井製作所の現行カタログと施工要領書を再確認する。公式表が変わっていれば、差分を説明して内蔵表を更新する。
