# 文書102: API Proxy 改造・詳細設計書 (改訂版)

## 1. 目的
`plugin_api_proxy` に対して、「マッピング機能」、「プリセット差込機能」、「APIテスト機能」を実装するための技術的な詳細を定義します。

## 2. データモデルの拡張 (`api_proxy_apis` コレクション)

以下のフィールドを追加実装します。

| フィールド名 | 型 | 説明 |
| :--- | :--- | :--- |
| `mappingEnabled` | `boolean` | マッピングの有効化 (デフォルト: `false`) |
| `mappingMode` | `string` | 変換モード。`json`, `csv`, `text` (デフォルト: `json`) |
| `requestMapping` | `json` | 入力パラメータの変換ルール |
| `responseMapping` | `json` | 出力データの変換ルール。JSONPathやプレースホルダ形式 |
| `preset` | `string` | 他プラグインから登録されたプリセットの識別キー |
| `testParams` | `text` | テスト実行時に入力されるパラメータ（Query, Body。JSON形式のテキスト） |
| `expectedResponse` | `text` | テスト実行時に比較対象とする「期待されるレスポンス」（JSON/Text形式） |

> [!NOTE]
> `testResponse` は、動的な実行結果であるためDB保存せず、フロントエンドのステートまたは実行時のコンテキストでのみ管理します。

## 3. マッピング機能の設計

### 3.1 レスポンスマッピング (JSON)
外部APIの応答（例: 複雑な深度を持つJSON）を、NocoBaseの `list` アクションが期待する形式（`data: [], count: number`）に変換します。

**内部データ構造（`responseMapping` に保存されるJSONの例）:**
```javascript
{
  // レスポンスJSON内のどこにリスト本体があるかを指定
  "list": "$.results",       // JSONPath: results配列を取得
  
  // 総件数が含まれるフィールドの指定
  "total": "$.total_count", 
  
  // 各要素のフィールドマッピング（テンプレート形式）
  "map": {
    "label": "{{name}}",    // 配列の各要素の 'name' フィールドを 'label' に
    "value": "{{id}}"       // 配列の各要素の 'id' フィールドを 'value' に
  }
}
```

### 3.2 処理の制約
- **ページネーション**: `mappingMode` が `none` 以外の場合、外部APIに対して全件取得を試み、メモリ上で変換を行うものとします（初期実装ではページング非対応）。

## 4. プリセット注入機能 (Preset Registry)

他のプラグインから、API設定の雛形やプログラムによる動的処理を登録できます。登録されたプリセットは、DBの設定よりも優先、またはDB設定のデフォルト値として機能します。

### 4.1 登録インターフェース (`ApiPreset`)
```typescript
interface ApiPreset {
  key: string;               // 識別キー (DBの preset フィールドと対応)
  label: string;             // UIで表示するラベル
  
  // --- コレクション設定のデフォルト値 ---
  baseUrl?: string;
  headers?: any;
  mappingMode?: string;
  requestMapping?: string;
  responseMapping?: string;
  
  // --- 3つのフックポイント ---
  /** 1. リクエスト時のマッピング前後に介入 */
  onRequest?: (ctx: Context) => Promise<void>;
  
  /** 2. APIコールの代わりの実行処理 (Execution Hook) */
  execute?: (requestData: any, ctx: Context) => Promise<any>;
  
  /** 3. レスポンスのマッピング処理に介入 */
  onResponse?: (responseData: any, ctx: Context) => Promise<any>;
}
```

## 5. APIテスト機能

### 5.1 テストプロセス
1. UI上の `testParams` (JSON) を読み込む。
2. マッピングロジックを実行し、変換されたリクエストを確認。
3. 外部API（またはプリセットの `execute`）を呼び出す。
4. 得られた結果を `expectedResponse` と比較表示する。

## 6. 実装計画 (実装順)

1.  **設定UIの実装** (最優先):
    - コレクションへのフィールド追加。
    - 設定画面への「マッピング設定」タブと「プリセット選択」の提供。
2.  **マッピングエンジンの実装**:
    - JSON/CSV/Textの変換ロジック本体の作成。
    - フィルタ演算子（`$includes` 等）のインメモリエミュレーション。
3.  **APIテスト機能の実装**:
    - テスト実行用のカスタムアクションの実装。
    - 期待値（`expectedResponse`）との比較表示UI。
4.  **プリセット登録機構の実装**:
    - `PresetRegistry` クラスの作成。
    - プラグイン起動時の登録インターフェースの公開。
