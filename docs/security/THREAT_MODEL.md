# NULL GPA Threat Model

## Protected data

Private display names, GPA values, and per-subject scores are high-sensitivity data. Public disclosure is an ACL decision, not a storage mode: even values selected as Public should remain encrypted at rest and only be projected into the public leaderboard by the confidential-compute path.

## Adversaries

The production design assumes a database administrator, API/EC2 host administrator, the solo project maintainer, an external attacker who compromises the web/API/DB tier, and other students may all attempt to recover private grades.

The intended property is that ordinary infrastructure credentials are insufficient to decrypt stored grade data. Decryption keys are to be usable only by a measured AWS Nitro Enclave accepted by KMS Recipient Attestation policy conditions.

## Explicit limit

A web operator who intentionally serves malicious future JavaScript could steal plaintext before encryption. Remote Attestation of the server-side enclave does not mathematically prevent that browser-layer attack. NULL GPA must therefore never claim “absolute anonymity” or “the operator can never see anything.”

Mitigation is verifiability: public repository, GitHub Actions-only production build/deploy, artifact provenance, immutable releases, published frontend bundle hashes, strict CSP, and a `/proof` page that separately shows frontend provenance and enclave attestation.

## Fail-closed rule

Production secure submission must not send grades when attestation verification, nonce binding, or expected measurement verification fails. There is no plaintext fallback.
