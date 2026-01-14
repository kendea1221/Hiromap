# 🗺️ Hiromap - AI駆動型広島観光マップ

> 不快指数アルゴリズムと情報鮮度を活用したインテリジェントな観光スポット推薦システム

[![Demo](https://img.shields.io/badge/Demo-Live-success)](https://hiromap.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff)](https://vitejs.dev/)

## 📖 概要

Hiromapは、**気象データと不快指数（DI）を活用したスマートな観光推薦システム**を搭載した広島観光マップアプリケーションです。従来の静的な観光案内とは異なり、リアルタイムの気温・湿度から不快指数を計算し、ユーザーの滞在時間と情報鮮度を考慮した最適なスポットを動的に提案します。

## 🎯 核心アルゴリズム

### 不快指数（DI）による推薦ロジック

```typescript
DI = 0.81T + 0.01H(0.99T - 14.3) + 46.3
```

- **T**: 気温（°C）
- **H**: 湿度（%）

**判定基準:**
- `DI ≥ 75` → 屋内スポット優先（蒸し暑く不快）
- `DI < 75` → 屋外スポット優先（快適）

### 情報鮮度考慮アルゴリズム

直近1時間以内にユーザーコメントがあるスポットを優先的に表示し、リアルタイムで人気のある場所を可視化します。

### 滞在時間マッチング

ユーザーの滞在可能時間（M分）と各スポットの推定滞在時間（S分）を比較し、`M ≥ S` の条件を満たすスポットのみを抽出します。

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript 5.6** - 型安全性
- **Vite 7.3** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **Lucide React** - アイコンライブラリ

### マップ & 位置情報
- **React Leaflet** - インタラクティブマップ
- **Leaflet** - オープンソースマップエンジン
- **Geolocation API** - 現在地取得

### データ & API
- **外部天気API**: `https://system-k.vercel.app/weather.json`
- **LocalStorage**: ユーザー生成コンテンツの永続化

### デプロイ
- **Vercel** - エッジコンピューティングプラットフォーム

## ✨ 主要機能

### 🤖 AI推薦システム
- 不快指数ベースの動的スポット提案
- 滞在時間を考慮したフィルタリング
- 情報鮮度による優先度付け

### 🗺️ インタラクティブマップ
- リアルタイム位置トラッキング
- クリックでスポット追加
- カテゴリ別フィルタリング（食事、ショッピング、歴史、自然、博物館、神社）

### 📊 スポット管理
- 写真ギャラリー
- コメント & 返信システム
- いいね機能
- 評価システム（5段階）
- お気に入り & 訪問済みマーク

### 🛤️ ルート作成
- 複数スポットを結ぶルート自動生成
- 総距離計算
- ポリラインでの経路可視化

### 🌤️ リアルタイム天気表示
- 外部APIからの天気データ取得
- 不快指数の自動計算
- ヘッダーでの気温・湿度表示

### 📱 レスポンシブデザイン
- モバイル完全対応
- タッチ操作最適化
- 画面サイズ別UI調整

### 🔐 ユーザー管理
- ニックネームベース認証
- LocalStorageでのセッション管理

## 🚀 セットアップ

```bash
# リポジトリクローン
git clone https://github.com/kendea1221/hiromap.git
cd hiromap

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
```

## 📂 プロジェクト構造

```
hiromap/
├── src/
│   ├── App.tsx          # メインアプリケーションロジック
│   ├── main.tsx         # エントリーポイント
│   └── assets/          # 静的アセット
├── public/
│   └── favicon.png      # ブランドアイコン
├── index.html           # HTMLテンプレート
├── vercel.json          # Vercel設定
└── package.json         # 依存関係
```

## 🧮 アルゴリズム詳細

### 推薦システムフロー

```
入力（滞在時間 M）
    ↓
天気API → 不快指数（DI）計算
    ↓
DI ≥ 75 ? → 屋内スポット抽出 : 屋外スポット抽出
    ↓
滞在時間フィルタ（M ≥ S）
    ↓
情報鮮度でソート（直近1時間コメント優先）
    ↓
上位3件を出力 + 自然言語説明生成
```

### データモデル

```typescript
type Spot = {
  id: string
  name: string
  lat: number
  lng: number
  kind: 'indoor' | 'outdoor' | 'user'
  category: 'food' | 'shopping' | 'history' | 'nature' | 'museum' | 'shrine' | 'other'
  photos: string[]
  comments: Comment[]
  ratings: Rating[]
  favorites: string[]
  visited: string[]
  openingHours: OpeningHours[]
  closedDays: number[]
  createdAt: number
}
```

## 🌐 デプロイ

Vercelへの自動デプロイ設定済み。`main`ブランチへのpushで自動的に本番環境が更新されます。

```bash
vercel --prod
```

## 📊 初期データ

- **20+スポット**: 広島の主要観光地を網羅
- **カテゴリ**: 食事(8), ショッピング(5), 歴史(2), 自然(5), 博物館(5), 神社(3)
- **営業時間**: 各スポットの実際の営業時間を反映

## 🎨 デザイン哲学

- **ミニマル**: 情報過多を避け、必要な情報のみを表示
- **直感的**: アイコンとカラーコーディングで操作を簡略化
- **アクセシブル**: モバイルファーストで全デバイス対応

## 🔧 今後の展開

- [ ] 多言語対応（英語、韓国語、中国語）
- [ ] オフラインモード（PWA化）
- [ ] ソーシャルシェア機能強化
- [ ] 機械学習による個人化推薦
- [ ] AR機能（位置ベース情報表示）

## 📄 ライセンス

MIT License
