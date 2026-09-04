# Security policy

NULL GPA handles sensitive academic data. Do not use real private grades in development or staging fixtures.

## Production security invariant

A production release is acceptable only when private display names, GPA values and subject scores are encrypted in the browser before the API host receives them, are decrypted only inside an attested AWS Nitro Enclave, and persistent decryption keys are constrained by AWS KMS Recipient Attestation conditions for the approved enclave measurement.

Any failure of attestation, nonce binding, expected measurement verification or KMS access must fail closed. There is no plaintext fallback path.

## Reporting

Until a dedicated private reporting channel exists, do not open a public issue containing an exploit that exposes real user data. Public architectural/security discussion that contains no private data is welcome.
