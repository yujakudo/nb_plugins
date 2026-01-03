# 文書102: API Proxy 改造・詳細設計書 (改訂版)

## 1. 目的
`plugin_api_proxy` に対して、「マッピング機能」、「プリセット差込機能」、「APIテスト機能」を実装するための技術的な詳細を定義します。

## 2. データモデルの定義 (`api_proxy_apis` コレクション)

以下のフィールドを追加実装し、UI上ではツールチップ (`tooltip`) を用いて説明を表示します。

| フィールド名 | 型 | インターフェース | 説明 |
| :--- | :--- | :--- | :--- |
| `mappingEnabled` | `boolean` | `checkbox` | マッピングの有効化。チェックボックス横に「マッピングを有効にする」と表示。 |
| `mappingMode` | `string` | `select` | 変換モード。`json`, `csv`, `text` (デフォルト: `json`) |
| `requestMapping` | `text` | `textarea` | 入力パラメータの変換ルール（JSON形式またはテキスト） |
| `responseMapping` | `json` | `json` | 出力データの変換ルール。モードに応じて動的にツールチップ内容が変化。 |
| `isList` | `boolean` | `checkbox` | レスポンスが配列形式であることを指定。ラベル: 「APIのレスポンスは配列」 |
| `listPath` | `string` | `input` | JSON配列が含まれる階層のパス (例: `data.items`) |
| `csvHasHeader` | `boolean` | `checkbox` | CSVの1行目がヘッダであることを指定。 |
| `preset` | `string` | `select` | 他プラグインから登録されたプリセットの識別キー |
| `testParams` | `text` | `textarea` | テスト実行時に入力されるパラメータ（JSON形式テキスト） |
| `expectedResponse` | `text` | `textarea` | テストの期待結果（JSON/Text形式） |

## 3. UI/UX 設計

### 3.1 画面レイアウト
設定画面は以下のタブ構成とします：

1.  **基本設定**: 名前、説明、メソッド、URL、ヘッダ、プリセット。
2.  **マッピング設定**:
    - マッピングの有効化 (Checkbox)
    - リクエストマッピング (TextArea, `mappingEnabled` ON 時のみ)
    - レスポンスの種類 (Select, `mappingEnabled` ON 時のみ)
    - リスト (Checkbox, JSON モードかつ `mappingEnabled` ON 時のみ)
    - リスト要素 (Input, `isList` ON 時のみ)
    - 一列目が列名 (Checkbox, CSV モード時のみ)
    - レスポンスマッピング (JSON, `mappingEnabled` ON 時のみ)
3.  **テスト**:
    - URL (Input, 読み取り専用)
    - リクエストデータ (TextArea, `testParamsInput`)
    - リクエストデータの保存 (Action)
    - リクエストの送信 (Action, テスト実行)
    - テスト結果 (Input, 読み取り専用, 期待されるレスポンスと実際の結果を比較して OK/NG を表示)
    - APIへのリクエストデータ (TextArea, 読み取り専用, シミュレート結果表示)
    - ステータス (Input, 読み取り専用)
    - APIからのレスポンスデータ (TextArea, 読み取り専用)
    - レスポンスデータ (TextArea, 読み取り専用, マッピング後の結果)
    - 期待されるレスポンス (TextArea, 編集可能)
    - 期待されるレスポンスの保存 (Action)
    - ※「送信」ボタンの誤操作防止のため、最下部に大きな余白を設定。

* ユーザの入力は、リクエストデータと期待されるレスポンスのみ。その他のテキストエリアはテストの実行結果が表示される（編集不可）。

4.  **利用制限設定**: 利用制限、最大利用回数、各種開始条件、タイムゾーン。

### 3.2 翻訳とツールチップ
- 各フィールドの説明は、ラベル右側の `(i)` アイコン（ツールチップ）内に表示されます。
- `i18n` ネームスペース (`@yujakudo/plugin-api-proxy:`) を明示的に指定、または `SchemaComponent` スコープに `t` を注入することで、正確な日本語翻訳を実現します。

## 4. マッピング機能の処理ロジック
(省略 - 既存セクション3を維持)

## 6. 実装計画 (進捗状況)

1.  **[完了] 設定UIの実装**:
    - コレクションへのフィールド追加とUIスキーマ (`collections.ts`, `schema.ts`) の構築。
    - ツールチップおよびチェックボックスラベルの国際化対応。
    - 入力項目の動的な表示制御 (Reactions) の実装。
2.  **[継続] マッピングエンジンの実装**:
    - `apiProxy.ts` における JSON/CSV/Text の変換ロジックの実装。
3.  **[予定] APIテスト機能の実装**:
    - 設定画面への「テスト実行」ボタンの追加と、バックエンドでのテスト用 `action` の実装。
4.  **[予定] プリセット登録機構の実装**:
    - `PresetRegistry` の作成と外部プラグイン向けインターフェースの公開。
