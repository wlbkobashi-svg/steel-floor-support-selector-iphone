# 鋼製床 支持台・ボルト組 かんたん選定

KIRII GTフロアー／GTダイレクトの支持台・ボルト組を、高さから選定するiPhone対応PWAです。

## 公開版

https://steel-floor-support-selector.workspace-671530.chatgpt.site

iPhoneのSafariで開き、共有ボタンから「ホーム画面に追加」を選択すると、アプリのように利用できます。初回読み込み後はオフライン起動にも対応します。

## 主な機能

- GTフロアー（一般体育館・剣道場・柔剣道場）／GTダイレクト対応
- 仕上高または根太天端を基準に選定
- 入力範囲全体を満たす標準組合せを最大3件表示
- 選定結果をPNG画像で保存・共有
- 入力内容を端末内に保存

標準表：STEEL FLOOR Ver.202602

最終決定前に最新カタログ・現場条件をご確認ください。

## 開発

Node.js 22以上とpnpmを使用します。

```bash
pnpm install
pnpm dev
```

ビルド確認：

```bash
pnpm build
```
