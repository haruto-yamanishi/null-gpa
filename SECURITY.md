# Security policy

NULL GPA handles sensitive academic data. Do not use real private grades in development, CI, screenshots, or staging fixtures.

## Current public MVP

The zero-cost launch architecture is Vercel + Supabase.

- Authentication uses Supabase Anonymous Auth.
- Row Level Security prevents one participant from directly selecting another participant's profile, GPA row, or subject-score rows.
- Public leaderboard data is exposed only through narrowly scoped RPC functions.
- A Private GPA is returned as `null` by the leaderboard RPC.
- Subject-statistics RPCs return only the caller's own score/rank plus thresholded aggregates; they do not return another participant's raw score.
- The repository, migrations, and CI are public so these controls can be audited.

## Important trust boundary

This MVP does **not** guarantee operator blindness. A Supabase project administrator remains inside the trust boundary and may have infrastructure-level access to stored data.

Do not claim that the developer is cryptographically unable to view grades, and do not claim complete anonymity.

A future confidential-compute design may move decryption/ranking into an attested TEE or another privacy-preserving computation system. Until that is actually deployed and independently verifiable, `/proof` must show operator blindness as **NOT GUARANTEED**.

## Reporting

Until a dedicated private reporting channel exists, do not open a public issue containing an exploit, token, screenshot, or data sample that exposes a real participant's academic data. Public architectural/security discussion that contains no private data is welcome.
