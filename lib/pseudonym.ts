const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function bytesToBase32Like(bytes: Uint8Array, length = 8) {
  let output = "";
  for (let i = 0; i < length; i++) {
    output += alphabet[bytes[i % bytes.length] % alphabet.length];
  }
  return `${output.slice(0, 4)}-${output.slice(4, 8)}`;
}

export async function boardPseudonym(accountId: string, boardScope: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${accountId}|${boardScope}`),
  );
  return bytesToBase32Like(new Uint8Array(signature));
}
