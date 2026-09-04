# NULL GPA

> 成績は入力する。公開するかは自分で決める。

NULL GPA は、学生が各科目の成績を入力すると単位加重 GPA を自動計算し、**任意参加者の中での GPA 順位・上位率・科目順位・平均・偏差値**を確認できる privacy-first な Web アプリです。

学校公式の順位ではありません。UI では必ず **「参加者内順位」** と表記し、母集団サイズ `N` を併記します。

現在のリポジトリは **Phase 1: Local UI / analytics MVP** までを実装しています。AWS Nitro Enclaves / KMS を使う production confidential-compute path は仕様とインターフェースを先に固定し、ローカル UI が「暗号化済みのふり」をしないよう `/proof` では `UNVERIFIED — LOCAL DEMO` を表示します。

---

## Current implementation

- 2026 Grade 4 の subject fixture
- 各科目の点数入力
- 単位加重 GPA のリアルタイム計算
- `90–100=S=4`, `80–89.99=A=3`, `70–79.99=B=2`, `60–69.99=C=1`, `<60=F=0`
- Anonymous / Named の切り替え
- GPA の Public / Private 切り替え
- **各科目ごとの Public / Private 切り替え**
- synthetic participant data に対する GPA 順位
- standard competition ranking (`#1, #2, #2, #4`)
- 科目順位・平均・中央値・偏差値計算ロジック
- Public API projection の形を実装（Private 値は `null`）
- `/proof` の検証 UI 契約
- unit tests
- GitHub Actions CI
- release manifest / GitHub Artifact Attestation の scaffold
- threat model / Nitro Enclave integration plan

実在学生の成績は fixture / test では使用しません。

---

# 1. Product definition

NULL GPA は、成績入力だけで GPA を計算し、参加者集団内で自分がどの位置にいるかを GPA / 科目単位で把握するための Web アプリです。

## Goals

- GPA を手計算せずに即時算出できる。
- GPA 順位・Top%・科目順位・平均・偏差値を確認できる。
- **名前、GPA、各科目成績の公開範囲をそれぞれ独立して選択できる。**
- Private に設定された生データを DB 管理者・Web/API サーバ管理者・製作者本人が通常権限で復号できない production architecture にする。
- 「暗号化している」と説明するだけでなく、稼働 artifact / Enclave / KMS policy の対応をユーザーが検証できる `/proof` を正式機能にする。

## Non-goals

- 学校公式の成績証明・公式順位・進級判定の代替ではない。
- 非参加者を含む学年全体順位を断定しない。
- MVP では学校システムとの真偽照合を行わない。データは `Self-reported` と明示する。

---

# 2. Privacy / disclosure model

「匿名か」と「成績を公開するか」は別の設定です。

| Data | Setting | Public | Private |
|---|---|---|---|
| Identity / display name | Named / Anonymous | display name を表示 | board-scoped pseudonym を表示 |
| GPA | Public / Private | GPA 数値を表示可能 | 順位だけ表示し数値は API に含めない |
| Subject score | 科目ごと Public / Private | 対象科目で点数表示可能 | 点数を API に含めない |

設定例:

| Identity | GPA | English IV | Board example |
|---|---|---|---|
| Anonymous | Private | Private | `#8 · Q7M4-K2PD · GPA hidden` |
| Named | Private | Private | `#8 · Haruto · GPA hidden` |
| Anonymous | Public | Private | `#8 · Q7M4-K2PD · 3.25` |
| Named | Public | Public | `#8 · Haruto · 3.25 / English IV 93` |

初回デフォルトは次の通りです。

- Identity: `Anonymous`
- GPA: `Private`
- 全科目: `Private`

Public は明示的 opt-in にします。`Public -> Private` は公開 projection と cache から即時削除します。

**Public に設定した値も DB 上では暗号化保存します。** Public は「Enclave が公開 projection に平文を出してよい」という ACL であり、「平文保存してよい」という意味ではありません。

---

# 3. Anonymous identity

匿名表示 ID はランキングボードごとに変えます。複数ボードを横断して同一人物を追跡しにくくします。

```text
board_pseudonym = Base32(HMAC(enclave_secret, account_id || board_scope))[0:8]
```

`board_scope` には年度・学年・ランキング種別・科目 ID を含めます。

```text
GPA board      -> Q7M4-K2PD
English IV     -> V2NC-8A3R
Discrete Math  -> 41XK-T9FW
```

GPA や成績点から ID を作ってはいけません。値域が小さいため総当たりで復元可能です。

---

# 4. Grade input and GPA

subject master が `academic_year`, `grade_level`, `name`, `credits`, `term`, `assessment_period` を管理し、通常ユーザーは単位数を変更できません。

Score は `0.00–100.00`、未確定は `null`。

Grading policy は version 管理します。初期 `2026-v1`:

| Score | Grade | Grade point |
|---:|:---:|---:|
| 90–100 | S | 4.0 |
| 80–89.99 | A | 3.0 |
| 70–79.99 | B | 2.0 |
| 60–69.99 | C | 1.0 |
| 0–59.99 | F | 0.0 |

```text
GPA = Σ(Grade Point × Credits) / Σ(Credits)
```

ブラウザは入力 UX のためローカル計算しますが、production 保存・ランキング時は **Enclave が subject master と grading policy から必ず再計算**し、クライアント申告 GPA を信用しません。

同じ snapshot で比較対象必須科目が揃った参加者だけを GPA board に含めます。

---

# 5. Ranking and statistics

## GPA rank

standard competition ranking を使用します。

```text
3.80 -> #1
3.65 -> #2
3.65 -> #2
3.51 -> #4
```

必ず `#8 / 37 participants` のように表示し、`4年生で8位` のような全学生を含む表現は禁止します。

## Subject rank

同一 `academic_year / grade_level / subject_id / assessment_period` の参加者のみ比較します。

点数が Private でも順位計算には含めますが、public API は生点数を返しません。

## Deviation score

```text
偏差値 = 50 + 10 * (x - μ) / σ
```

- `σ = 0`: 非表示
- `N < 10`: 平均・標準偏差・偏差値・科目統計を公開しない
- `N = 10–19`: 平均は 1 点単位、偏差値は整数
- `N >= 20`: 通常精度

少人数統計から他人の点数を逆算されにくくするため、集計値は k-anonymity 相当の閾値と snapshot 更新を使います。本人順位は Enclave からリアルタイム取得可能にします。

---

# 6. Security claim

Production で目指す claim:

> Private に設定された名前・GPA・科目点数はブラウザから Attested Enclave まで暗号化され、Web/API サーバと DB には平文で到達しない。保存データの復号キーは、承認された Enclave measurement を満たす実行コードだけが AWS KMS から利用できる。

## Protected assets

- Private display name
- GPA
- Subject scores
- account ↔ private grade association

## Threat actors

- DB administrator
- API / EC2 host administrator
- solo project maintainer
- external attacker compromising web/API/DB
- other students

Private raw data は ordinary infrastructure credentials だけでは復号できない構成にします。

---

# 7. Important security boundary

**「完全匿名」「絶対に製作者も見られない」とは表現しません。**

通常の Web では、サイト運営者が将来 frontend JavaScript を悪意あるコードに差し替え、暗号化前の入力を盗む可能性を Remote Attestation だけで完全には消せません。

単独開発モデルで証明する対象は次です。

1. 稼働 artifact が公開 source / build provenance と対応していること。
2. Private stored data が承認済み Enclave 外で復号できないこと。
3. production 変更が公開 Git history / artifact attestation / transparency log に痕跡を残すこと。

Mitigation:

- Public GitHub repository
- GitHub Actions 経由のみの production build/deploy
- GitHub Artifact Attestation
- immutable release
- public frontend bundle hash
- strict CSP
- third-party JavaScript 原則禁止
- grade input page では analytics を使わない
- `/proof` で frontend provenance と enclave attestation を別々に表示

---

# 8. Production confidential-compute architecture

比較可能暗号 / order-preserving encryption は利用せず、参加者数が数十〜数百人規模であることを活かして承認済み Enclave 内で必要時に復号・集計します。

```text
Browser plaintext
   ↓ ECDH P-256 + HKDF-SHA-256 + AES-256-GCM
Ciphertext on API host
   ↓ vsock
[Nitro Enclave: decrypt / validate / calculate / rank / ACL]
   ↓ AES-256-GCM + KMS-wrapped DEK
PostgreSQL ciphertext only
```

## Submission flow

1. Browser generates random nonce (>=128bit) and ephemeral P-256 key pair.
2. Browser requests `/v1/attestation?nonce=...`.
3. Enclave returns signed AWS Nitro attestation document with nonce, ephemeral public key and measurements.
4. Browser verifies Nitro certificate chain, nonce, expected PCR0 / ImageSha384.
5. Failure => submission blocked. No plaintext fallback.
6. Browser + Enclave derive session key via ECDH + HKDF-SHA-256.
7. Browser encrypts display name, grades, visibility ACL, snapshot id and policy version using AES-256-GCM.
8. API parent receives ciphertext only and forwards via vsock.
9. Enclave decrypts and recomputes GPA from trusted policy/master data.
10. Enclave encrypts persistent fields with random DEK.
11. DEK is wrapped by AWS KMS.
12. PostgreSQL stores ciphertext, wrapped DEK and non-sensitive metadata only.

## KMS restriction

KMS key policy must restrict decrypt/data-key operations using Nitro Recipient Attestation measurement condition keys (`ImageSha384` / PCR conditions). The host with the same IAM role must not be able to decrypt without an accepted attestation document.

Production debug enclave is forbidden.

---

# 9. `/proof` — verifiable privacy

`/proof` is a product feature, not documentation decoration.

It must expose:

| Field | Meaning |
|---|---|
| Attestation status | current enclave signature valid / invalid |
| PCR0 / Image SHA-384 | running enclave measurement |
| Expected PCR0 | release-pinned expected measurement |
| Source commit | Git commit for this release |
| Frontend bundle SHA-256 | hash of currently served production bundle |
| KMS policy hash | hash of published KMS policy copy |
| Last verification | browser verification time |
| Build provenance | repository / workflow / commit / artifact digest |

Browser verification must not trust a server-returned boolean. It verifies the attestation evidence itself.

Status presentation:

```text
VERIFIED ENCLAVE
```

or

```text
UNVERIFIED — SUBMISSION BLOCKED
```

The current local demo intentionally shows unverified state.

---

# 10. Authentication

Email, legal name and student ID are not mandatory.

Preferred production authentication: WebAuthn / Passkey.

```text
account_id = random UUID
credential = WebAuthn public key
email = not required
legal_name = not required
```

Named mode uses a user-defined display name. It does not have to be a legal name。

Passkey can be registered on multiple devices. Optional recovery codes may be supported, but the recovery secret plaintext is never stored server-side. The operator must not provide manual identity-based account recovery that breaks anonymity.

---

# 11. Data model

Searchable non-sensitive metadata and enclave-only ciphertext are separated.

```text
accounts
  id UUID PK
  webauthn_credential_public JSONB
  created_at timestamptz

subjects
  id UUID PK
  academic_year int
  grade_level int
  name text
  credits numeric
  term text
  assessment_period text

snapshots
  id UUID PK
  academic_year int
  grade_level int
  required_subject_ids UUID[]
  grading_policy_version text
  status text

encrypted_profiles
  account_id UUID
  ciphertext bytea
  wrapped_dek bytea
  crypto_version text
  updated_at timestamptz

encrypted_grade_records
  account_id UUID
  subject_id UUID
  snapshot_id UUID
  ciphertext bytea
  wrapped_dek bytea
  visibility enum(public, private)
  revision int

public_projections
  board_scope text
  pseudonym text
  public_display_name text nullable
  rank int
  public_value numeric nullable
  generated_at timestamptz
```

**禁止:** `plaintext_score`, `plaintext_gpa`, `plaintext_name` のような列。

All ciphertext includes crypto version / algorithm / key id / nonce metadata for rotation and migration. Do not invent cryptographic primitives.

---

# 12. API contract

Public API と Secure/Attested API を分離します。

```text
GET    /v1/attestation?nonce=...
POST   /v1/auth/webauthn/*
POST   /v1/secure/grades
POST   /v1/secure/me
POST   /v1/secure/visibility
DELETE /v1/secure/account
GET    /v1/boards/gpa
GET    /v1/boards/subjects/:id
GET    /v1/stats/:scope
GET    /v1/proof/manifest
```

Public board response example:

```json
[
  {
    "rank": 8,
    "label": "Q7M4-K2PD",
    "value": null,
    "valueVisibility": "private"
  },
  {
    "rank": 9,
    "label": "Haruto",
    "value": 3.21,
    "valueVisibility": "public"
  }
]
```

Private 値は `•••` を返して CSS で隠すのではなく、**API response 自体に含めません。**

禁止事項:

- admin/debug endpoint から他人の private raw values を返す
- `?include_private=true`
- raw encrypted payload の通常管理画面 download
- request body を Sentry/APM/analytics へ送信

---

# 13. UX requirements

First run:

```text
Create passkey
   ↓
Select year / grade / snapshot
   ↓
Enter scores
   ↓
Local GPA preview
   ↓
Set Identity / GPA / per-subject visibility
   ↓
Verify Enclave automatically
   ↓
Encrypted submit
   ↓
My Analysis + Participant Leaderboards
```

Grade input row contains:

- subject name
- credits
- score
- per-subject visibility toggle

GPA updates on input and is labeled `Local calculation` before secure submission.

Results include:

- GPA
- `#rank / N participants`
- Top %
- subject rank / N
- deviation score
- mean/median difference
- current disclosure state
- verification state / proof link

---

# 14. Data quality / abuse

Encryption does not stop fabricated grades.

MVP:

- Self-reported label
- 1 account / 1 snapshot / 1 current record set
- revision updates instead of duplicate current records
- Enclave rejects invalid ranges and unknown subject ids
- Enclave recalculates GPA
- invite-only one-time enrollment token for basic Sybil resistance
- token/account association stored separately from grade data

Future screenshot import may parse BLEND locally in-browser, but screenshots are modifiable and therefore are not called school-verified credentials. Images must not be uploaded to the server merely for parsing.

---

# 15. Administrator boundary

Admin may:

- edit subject master
- edit snapshot definitions
- manage grading policy versions
- see participant count / operational health
- request public projection regeneration
- inspect release / attestation health

Admin may **not**:

- view Private score / GPA / name
- export individual full grades
- directly decrypt using KMS
- override Private to Public

---

# 16. Logging and deletion

- Avoid long-term IP retention; only minimal rate-limit use.
- Do not log account identity and grade ciphertext together unnecessarily.
- Enclave stdout/stderr must never print raw grades.
- Request bodies are excluded from error reporting / analytics.
- CloudTrail is used for KMS attestation-call audit.

Account deletion removes public projection and wrapped per-user key material to achieve cryptographic erasure. Encrypted backups rotate within the retention window and deleted key material is not restored.

---

# 17. Non-functional requirements

- TLS 1.3 plus application-layer Browser ↔ Enclave encryption.
- Session key: ECDH P-256 + HKDF-SHA-256.
- Payload/storage: AES-256-GCM.
- Never reuse nonce/IV.
- Short-lived session keys remain in memory only.
- No keys in localStorage, logs or analytics.
- Strict CSP / CSRF / CORS / rate limiting / dependency audit.
- Accessibility: keyboard, form labels, contrast, mobile support.
- 100–500 participant board update target <= 2 seconds.
- Crypto failure => fail closed; never plaintext fallback.

---

# 18. MVP acceptance criteria

## Functional

- 10+ subjects produce expected weighted GPA.
- tied GPA produces `#1, #2, #2, #4`.
- subject rank / average / deviation match fixtures.
- `N < 10` statistics are absent from public API.
- Identity, GPA and **each subject score** can independently switch Public / Private.
- Anonymous user receives different pseudonyms per board scope.
- Private value is absent from public leaderboard response.

## Security

- Browser network capture does not contain plaintext test scores (`93`, `89`, `3.25`, etc.) in secure API payloads.
- PostgreSQL dump does not contain searchable Private name / score / GPA plaintext.
- EC2 host root cannot directly decrypt the DEK.
- KMS direct call without attestation returns AccessDenied.
- wrong-PCR enclave cannot decrypt.
- tampered attestation / nonce / PCR makes browser fail closed.
- production debug enclave cannot access KMS.
- logs/APM/Sentry contain no test grade plaintext.
- `/proof` PCR matches KMS policy and release manifest.
- production artifact digest matches GitHub Artifact Attestation and immutable release manifest.

## Privacy

- First run is Private by default.
- Public -> Private removes public projection immediately.
- Delete account removes public projection and wrapped user key.
- Admin interface contains no Private raw-data screen.

**Definition of Done:** ranking が動くだけでは完成ではありません。Attestation / KMS PCR restriction / DB ciphertext / ACL tests を含めて通って初めて MVP 完成です。

---

# 19. Solo developer release model

This project assumes **one developer**.

Multiple-human approval is not required because it is unrealistic for this project. Instead production change history is made independently inspectable:

```text
Public source
  -> GitHub Actions build
  -> artifact provenance
  -> immutable release
  -> published frontend hash
  -> enclave EIF measurement
  -> KMS measurement policy
```

Production direct deploy paths such as manual SSH image replacement or local-machine deployment are prohibited by policy. Only artifacts tied to a public immutable release and provenance record are production candidates.

This does **not** prove that the solo developer can never intentionally publish malicious code. It makes the running build traceable to public code and makes private stored data undecryptable by ordinary host credentials when the enclave/KMS design is correctly deployed.

---

# 20. Implementation phases

| Phase | Scope | Exit |
|---|---|---|
| 0 | specification / fixtures | GPA and rank fixtures fixed |
| 1 | local UI / GPA / visibility / analytics | UX works without server |
| 2 | Passkey / account / board pseudonyms | PII-free login |
| 3 | Enclave core | decrypt / validate / calculate / rank / ACL |
| 4 | KMS + PostgreSQL | host cannot decrypt |
| 5 | public boards / stats thresholds | private leak tests pass |
| 6 | browser attestation verifier / proof | browser verifies PCR |
| 7 | production gate / artifact attestation / immutable release / CSP / deletion | all acceptance criteria pass |

Current code status: **Phase 1 implemented; Phase 2+ pending.**

---

# 21. Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Tests:

```bash
npm test
npm run lint
npm run build
```

Synthetic fixtures are used in the current demo. Do not enter real private grade data into an unverified local or public demo deployment and assume the production security claim applies.

---

# 22. Repository structure

```text
app/
  api/boards/          # public projection demo endpoints
  api/proof/manifest/  # release/proof contract
  proof/               # Privacy Proof UI
components/
  Dashboard.tsx        # local grade/privacy/analytics MVP
lib/
  grading.ts           # grading policy + weighted GPA
  stats.ts             # ranking / mean / median / deviation
  leaderboard.ts       # participant analytics
  pseudonym.ts         # board-scoped HMAC pseudonym helper
  fixtures.ts          # synthetic-only data
__tests__/
docs/security/
.github/workflows/
```

---

# 23. Privacy contract

> **Private raw values never leave the browser as plaintext, never exist in the application database as plaintext, and can only be decrypted inside an attested enclave whose measurement is constrained by KMS policy. Public disclosure is a user-controlled release decision, not a storage mode.**

This sentence is a production target and release contract. The current local demo is explicitly not an attested production deployment.

---

# 24. References

- AWS KMS Developer Guide — Condition keys for Nitro Enclaves  
  https://docs.aws.amazon.com/kms/latest/developerguide/conditions-nitro-enclave.html
- AWS Nitro Enclaves — Using cryptographic attestation with AWS KMS  
  https://docs.aws.amazon.com/enclaves/latest/user/kms.html
- AWS KMS — Attested calls  
  https://docs.aws.amazon.com/kms/latest/developerguide/attested-calls.html
- GitHub Artifact Attestations  
  https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations

---

## License

TBD before public release.
