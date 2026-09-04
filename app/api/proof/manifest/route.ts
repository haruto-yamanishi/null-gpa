import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    environment: process.env.VERCEL_ENV ?? "development",
    sourceCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
    enclave: {
      attested: false,
      reason: "Nitro Enclave integration is not connected in the web demo.",
      pcr0: null,
      imageSha384: null,
    },
    securityClaim: "Secure submission must fail closed until browser-side attestation verification succeeds.",
  });
}
