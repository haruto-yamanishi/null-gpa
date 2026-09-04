# Nitro Enclave production integration plan

The current repository implements the local analytics UX, ranking/statistics rules, privacy ACLs, API projection shape, test fixtures, proof-page contract, and release provenance scaffolding. It intentionally does **not** pretend that a local Next.js demo is an attested confidential-compute deployment.

Production secure path:

1. Browser generates a random nonce and ephemeral P-256 ECDH key pair.
2. Browser requests `/v1/attestation?nonce=...`.
3. Enclave returns an AWS Nitro attestation document containing the nonce, enclave ephemeral P-256 public key, and enclave measurements.
4. Browser verifies the Nitro certificate chain, nonce and release-pinned PCR/ImageSha384. Submission is blocked on failure.
5. Browser and enclave derive an AES-256-GCM session key through ECDH P-256 + HKDF-SHA-256.
6. Browser encrypts display name, all subject scores, ACLs, snapshot id and policy version before the API host receives them.
7. Enclave decrypts, validates the subject master, recomputes GPA, computes rank/statistics and applies disclosure ACLs.
8. Persistent fields are encrypted with random DEKs; DEKs are wrapped with AWS KMS.
9. KMS key policy restricts decrypt/data-key access using Nitro Recipient Attestation measurement condition keys.
10. PostgreSQL receives ciphertext, wrapped keys and non-sensitive metadata only.

A release is not production-ready until host-root direct KMS decrypt, wrong-PCR decrypt, tampered-attestation submission, plaintext network capture, DB plaintext search and logging leakage tests all fail/pass as specified in README acceptance criteria.
