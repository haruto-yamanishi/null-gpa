# NULL GPA

神山まるごと高専 2026年度4年生向けの、**非公式・自己申告型 GPA / 成績ランキング Web アプリ**です。

- Production: https://null-gpa.vercel.app
- 学校公式サービスではありません
- 順位は **参加者内順位** です
- 成績は Self-reported であり、学校の成績データとの照合はしていません

成績を入力すると単位加重 GPA を計算し、GPA順位・科目別順位・上位率・偏差値などを確認できます。名前、出席番号、GPA、各科目点数はそれぞれ公開範囲を選べます。

---

## 現在の公開版でできること

- 2026年度4年生の10科目を入力
- 入力中に GPA をリアルタイム計算
- 保存時に DB 側でも GPA を再計算
- GPA の参加者内ランキング
- 科目ごとの参加者内ランキング
- GPA の上位率表示
- 科目ごとの平均・中央値・偏差値
- 成績登録済み参加者だけに限定したランキング閲覧
- 再訪時の「出席番号 + ランダムな登録済み1科目の点数」による簡易確認
- Name / Anonymous の切り替え
- 出席番号 401〜440 の登録
- 名前、出席番号、GPA、各科目点数の公開設定
- 同一出席番号の重複登録防止
- マイページで保存済みデータを確認
- Supabase Anonymous Auth によるブラウザ単位のセッション
- Supabase Row Level Security (RLS)
- Private 値を除外したランキング RPC
- GitHub Actions で `lint / test / build`

---

## 重要な注意

### 学校公式順位ではない

NULL GPA が表示する順位は、このアプリに参加しているユーザーだけを母集団にした順位です。

`#8 / 23` は「4年生全体で8位」という意味ではなく、**参加者23人の中で8位**という意味です。

### 成績は自己申告

入力された点数が本人の本当の成績かどうかは検証していません。

出席番号 401〜440 を必須・一意にしているのは、同じ人が複数アカウントを作ってランキングを大きく歪めることを減らすためです。**出席番号の入力だけでは本人確認にはなりません。**

### Private は「暗号化」ではない

現在の公開版は **Vercel + Supabase のゼロコスト MVP** です。

Private に設定した値は、他の一般ユーザーが直接読めないよう RLS で制限し、ランキング RPC でも値を `null` にして返しません。

ただし、現在のデータベースにはプロフィール・点数・GPAが通常の PostgreSQL データとして保存されます。**Supabase プロジェクト管理者は trust boundary の内側です。**


現在保証しているのは、主に **参加者同士の直接アクセス制御と、公開設定に応じたランキング出力の制御**です。

詳しくは [`SECURITY.md`](./SECURITY.md) と `/proof` を参照してください。

---

## 公開設定

各データの公開範囲は独立しています。

| Data | Setting | 公開時 | 非公開時 |
|---|---|---|---|
| 表示名 | Name / Anonymous | 入力した表示名 | 匿名ID |
| 出席番号 | Public / Private | `No.439` のように表示 | ランキングには出さない |
| GPA | Public / Private | GPA数値を表示 | 順位だけ表示 |
| 科目点数 | 科目ごと Public / Private | 点数を表示 | 順位だけ表示 |

現行 UI の初期値は次の通りです。

- Identity: `Name`
- 出席番号: 必須 / `Private`
- GPA: `Public`
- 各科目: `Public`

Anonymous に切り替えると、出席番号の公開設定はいったん Private に戻ります。

---

## 出席番号 401〜440

2026年度4年生向けのため、出席番号は `401`〜`440` のみ受け付けます。

DB では以下を強制しています。

- `401 <= seat_number <= 440`
- `seat_number IS NOT NULL`
- `seat_number` は全プロフィールで一意

同じ番号を別ユーザーが登録しようとすると保存を拒否します。

認証は Supabase Anonymous Auth なので、現在は **同じブラウザのセッションから更新する設計**です。ブラウザのサイトデータを消したり別端末へ移動した場合、同じ匿名アカウントを自動復旧する仕組みはまだありません。

### ランキングの閲覧確認

ランキングは、1科目以上の成績を登録した参加者だけ閲覧できます。

- 成績を保存した直後は、そのままランキングを閲覧できます
- タブを閉じて再訪した場合は、出席番号を入力します
- 登録済み科目からランダムに出題された1科目の点数が一致すると閲覧できます
- 確認後のサーバー側アクセス許可は12時間で失効します
- 確認問題は10分で失効し、1問につき5回まで回答できます

この仕組みはランキングを参加者に限定するための簡易確認であり、学校データと照合する強い本人認証ではありません。

---

## GPA の計算

現在の grading policy:

| Score | Grade | Grade Point |
|---:|:---:|---:|
| 90–100 | S | 4.0 |
| 80–89.99 | A | 3.0 |
| 70–79.99 | B | 2.0 |
| 60–69.99 | C | 1.0 |
| 0–59.99 | F | 0.0 |

単位加重 GPA:

```text
GPA = Σ(Grade Point × Credits) / Σ(Credits)
```

ブラウザ側で入力中のプレビューを計算し、保存後は Supabase の `refresh_my_gpa()` でも `grade_submissions` と `subjects` から再計算します。

クライアントから GPA 数値そのものを保存値として信用する設計にはしていません。

---

## 対象科目

現在は 2026年度4年生の以下10科目を固定で扱っています。

| 科目 | 単位 |
|---|---:|
| 英語IV | 4 |
| 心理学 | 2 |
| 解析学I | 2 |
| 離散数学 | 2 |
| 認知科学 | 4 |
| 保健体育IV | 2 |
| WebプログラミングII | 2 |
| コンピュータアーキテクチャ | 2 |
| ネイバーフッド演習 | 2 |
| デザインエンジニアリング演習 | 2 |

---

## ランキング

GPA順位・科目順位ともに PostgreSQL の `rank()` 相当の standard competition ranking を使います。

```text
3.80 -> #1
3.65 -> #2
3.65 -> #2
3.51 -> #4
```

GPAランキングでは以下を表示します。

- 順位
- 参加者数
- 上位率
- 表示名または匿名ID
- 公開されている場合のみ出席番号
- 公開されている場合のみGPA

上位率は現在、次の計算です。

```text
Top % = rank / participant_count × 100
```

---

## 科目統計と偏差値

偏差値:

```text
偏差値 = 50 + 10 × (自分の点数 - 平均) / 標準偏差
```

少人数から他人の点数を推測しにくくするため、集計値には閾値があります。

- `N < 10`: 平均・中央値・偏差値を表示しない
- `N = 10–19`: 平均・中央値・偏差値を整数に丸める
- `N >= 20`: 小数1桁まで表示
- 標準偏差が0の場合: 偏差値を表示しない

本人の科目順位は、本人がその科目を登録していれば取得できます。

---

## 現在のアーキテクチャ

```text
Browser
  ├─ Next.js UI
  ├─ local GPA preview
  └─ Supabase Anonymous Auth session
          ↓
Supabase
  ├─ auth.users
  ├─ public.profiles
  ├─ public.grade_submissions
  ├─ public.gpa_snapshots
  ├─ public.subjects
  ├─ RLS
  └─ leaderboard / statistics RPC
          ↓
Vercel
  └─ Next.js production deployment
```

### テーブル

`profiles`

- anonymous auth user id
- pseudonym
- Name / Anonymous
- display name
- seat number
- seat number visibility
- GPA visibility

`grade_submissions`

- user id
- subject id
- score
- subject visibility

`gpa_snapshots`

- user id
- calculated GPA
- graded credits

`subjects`

- subject metadata
- credits
- academic year / grade

---

## RLS / RPC の考え方

一般ユーザーが直接テーブルを読む場合、RLS によって自分のデータだけに制限します。

ランキングでは Security Definer RPC が全参加者を順位計算に含め、その後に公開設定に応じて値を projection します。

たとえば GPA が Private の参加者も順位計算には含まれますが、RPC の `gpa` は `null` になります。

同様に科目点数が Private の場合も、その点数は順位計算には使われますが、他ユーザー向けのランキング返却値は `null` です。

---

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 3
- Supabase JS 2
- Supabase Auth / PostgreSQL / RLS / RPC
- Vercel
- Vitest
- ESLint
- GitHub Actions

---

## Local development

### 1. Install

```bash
npm install
```

### 2. Environment variables

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

`NEXT_PUBLIC_` の値はブラウザへ公開される前提です。**Supabase service role key などの秘密鍵を `NEXT_PUBLIC_` に入れないでください。**

### 3. Supabase

Supabase Dashboard で Anonymous Sign-Ins を有効化し、以下の migration を順番に実行します。

```text
supabase/migrations/202609040001_initial.sql
supabase/migrations/202609040002_subject_leaderboard.sql
supabase/migrations/202609040003_seat_numbers.sql
```

既存DBを migration 003 へ上げる場合、`seat_number` が無い古い `profiles` 行が残っていると `NOT NULL` 化に失敗します。先にテストデータを削除するか、既存プロフィールへ出席番号を割り当ててから実行してください。

### 4. Start

```bash
npm run dev
```

Open http://localhost:3000

---

## Test / CI

```bash
npm run lint
npm test
npm run build
```

`main` への push と pull request では GitHub Actions が同じ検証を実行します。

---

## Deployment

現在の production は Vercel です。

Vercel 側に以下を設定します。

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Production / Preview で必要な environment に変数を設定し、`main` の deployment を production にします。

公開URL:

https://null-gpa.vercel.app

---

## Repository structure

```text
app/
  page.tsx                 # Home
  submit/                  # 成績入力
  rankings/                # GPA / 科目ランキング
  me/                      # マイページ
  proof/                   # 現在のPrivacy / RLS説明
  api/                     # demo / proof routes
components/
  Dashboard.tsx
  PrivacyControls.tsx
  GradeTable.tsx
  RankingBoard.tsx
  SubjectBoards.tsx
  MyPage.tsx
lib/
  grading.ts
  stats.ts
  leaderboard.ts
  fixtures.ts
  supabase/
supabase/migrations/
__tests__/
docs/security/
SECURITY.md
```

---

## Security

このアプリは実際の学業成績を扱うため、セキュリティ問題を報告するときは実在ユーザーの点数、トークン、個人情報を Public Issue に貼らないでください。

現在の trust boundary と既知の制約は [`SECURITY.md`](./SECURITY.md) に記載しています。

将来的に TEE / confidential compute などで operator blindness を実装する可能性はありますが、**現在の production がその構成で動いているとは主張しません。**

---

## Current limitations

- 学校公式データとの照合なし
- 出席番号だけでは本人確認にならない
- Anonymous Auth のため端末移行・アカウント復旧が弱い
- Supabase project administrator は raw data の trust boundary 内
- 2026年度4年生・401〜440・現在の10科目に固定
- 全学年対応は未実装
- 学校公式順位ではない

---

## Roadmap

- ブラウザ変更・端末変更に耐えるアカウント復旧
- Passkey / WebAuthn の検討
- 年度・学年・科目マスターの一般化
- 入力UXの改善
- BLEND等からのローカル取り込み検討
- より強いSybil対策
- operator blindness を実現できる confidential-compute 構成の検討

---

## License

現在、このリポジトリには明示的な OSS ライセンスを設定していません。公開リポジトリであることと、自由な再利用・再配布を許可することは別です。必要に応じて今後 `LICENSE` を追加します。
