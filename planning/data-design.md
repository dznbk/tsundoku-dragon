# データ設計

## 概要

DynamoDBのシングルテーブル設計を採用。
PK（Partition Key）とSK（Sort Key）の組み合わせで各エンティティを管理する。

---

## テーブル構造

```
PK                    SK                              データ内容
──────────────────────────────────────────────────────────────────
USER#{userId}         PROFILE                         ユーザー情報
USER#{userId}         BOOK#{bookId}                   本の情報
USER#{userId}         BOOK#{bookId}#LOG#{timestamp}   戦闘ログ
USER#{userId}         SKILL#{skillName}               ユーザーのスキル経験値
USER#{userId}         CUSTOM_SKILL#{skillName}        ユーザー独自スキル定義
GLOBAL                SKILL#{skillName}               グローバルスキルマスタ
```

---

## エンティティ詳細

### ユーザー（PROFILE）

```json
{
  "PK": "USER#abc123",
  "SK": "PROFILE",
  "displayName": "ユーザー名",
  "createdAt": "2024-12-14T10:00:00Z"
}
```

※認証情報はFirebase Authで管理。DynamoDBにはアプリ固有の情報のみ保存。

---

### 本（BOOK）

```json
{
  "PK": "USER#abc123",
  "SK": "BOOK#001",
  "title": "データベース設計入門",
  "isbn": "9784774183169",
  "totalPages": 350,
  "currentPage": 150,
  "skills": ["DB", "設計"],
  "enemyImageUrl": "https://...",
  "round": 1,
  "status": "reading",
  "createdAt": "2024-12-14T10:00:00Z"
}
```

| 属性          | 説明                             |
| ------------- | -------------------------------- |
| isbn          | 国際標準図書番号。書影取得に使用 |
| currentPage   | 現在の読了ページ数               |
| skills        | この本に紐づくスキル（複数可）   |
| enemyImageUrl | 敵（ドラゴン）の画像URL          |
| round         | 周回数（再読時にインクリメント） |
| status        | reading / completed / archived   |

#### 設計理由

**currentPage を本に持つ理由**

- 本一覧表示時に毎回全ログを集計するのは非効率
- 進捗記録時にログ追加 + currentPage更新の2操作を行う

**skills を配列で持つ理由**

- 1冊の本に複数のスキルが紐づく（例：「DB本」→ DB, 設計）
- 本登録時にユーザーが選択

**round（周回数）を持つ理由**

- 再読時は同じエントリで進捗リセット
- 何回読んだかを記録（将来的に再読ボーナスなどに活用可能）

---

### 戦闘ログ（LOG）

```json
{
  "PK": "USER#abc123",
  "SK": "BOOK#001#LOG#20241214120000",
  "pagesRead": 30,
  "memo": "正規化の概念を理解した",
  "createdAt": "2024-12-14T12:00:00Z"
}
```

| 属性      | 説明                       |
| --------- | -------------------------- |
| pagesRead | 今回読んだページ数（差分） |
| memo      | 学習メモ（任意）           |

#### 設計理由

**差分記録にした理由**

- 「今日30ページ読んだ」という自然な入力
- ログとして履歴が残る
- 合計は本のcurrentPageで取得可能

**メモを任意にした理由**

- 毎回必須だと記録が億劫になる
- 書きたいときだけ書ける

**メモの検索について**

- DynamoDBは全文検索に向かない
- MVPでは検索機能は実装しない（YAGNI）
- 本ごとのログ一覧はPK/SKで取得可能

---

### ユーザースキル経験値（SKILL）

```json
{
  "PK": "USER#abc123",
  "SK": "SKILL#PHP",
  "exp": 1500,
  "level": 5
}
```

| 属性  | 説明         |
| ----- | ------------ |
| exp   | 累積経験値   |
| level | 現在のレベル |

---

### ユーザー独自スキル（CUSTOM_SKILL）

```json
{
  "PK": "USER#abc123",
  "SK": "CUSTOM_SKILL#ニッチな技術",
  "createdAt": "2024-12-14T10:00:00Z"
}
```

ユーザーが自由入力で作成したスキル。
本登録時の選択肢として表示される。

---

### グローバルスキルマスタ（GLOBAL SKILL）

```json
{
  "PK": "GLOBAL",
  "SK": "SKILL#PHP",
  "category": "プログラミング言語"
}
```

全ユーザー共通のスキルマスタ。
初期データとしてシードで投入。

#### 設計理由

**グローバル + ユーザー独自の2層構造にした理由**

- 一般的なスキル（PHP、DB、Go等）は表記揺れを防ぎたい
- ニッチなスキルでグローバルを汚染したくない
- 本登録時は両方から選択可能

---

## 主要なアクセスパターン

| ユースケース         | クエリ                                              |
| -------------------- | --------------------------------------------------- |
| 自分の本一覧         | PK=USER#{userId}, SK begins_with BOOK#              |
| 特定の本の詳細       | PK=USER#{userId}, SK=BOOK#{bookId}                  |
| 本の戦闘ログ一覧     | PK=USER#{userId}, SK begins_with BOOK#{bookId}#LOG# |
| 自分のスキル一覧     | PK=USER#{userId}, SK begins_with SKILL#             |
| 自分の独自スキル一覧 | PK=USER#{userId}, SK begins_with CUSTOM_SKILL#      |
| グローバルスキル一覧 | PK=GLOBAL, SK begins_with SKILL#                    |

---

## 書影の取得

ISBNを保存しておき、書影は外部APIから取得する。

**利用可能なAPI：**

- openBD（無料、登録不要、本の販促目的なら商用利用可）
- 国立国会図書館サーチ 書影API（無料、非営利目的なら申請不要）

**URL例（NDLサーチ）：**

```
https://ndlsearch.ndl.go.jp/thumbnail/{ISBN}.jpg
```

ISBNがない本（同人誌など）は書影なしで対応。
画像アップロード機能はMVPでは実装しない。
