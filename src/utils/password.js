// password.js
export function generateTempPassword(opts = {}) {
  const {
    length = 12,
    requireUpper = true,
    requireLower = true,
    requireNumber = true,
    requireSymbol = true,
    excludeAmbiguous = true,
  } = opts;

  // exclude ambiguous chars: I l 1 O 0 etc.
  let U = "ABCDEFGHJKMNPQRSTUVWXYZ";
  let L = "abcdefghjkmnpqrstuvwxyz";
  let N = "23456789";
  let S = "!@#$%^&*()-_=+[]{};:,.?";

  if (!excludeAmbiguous) {
    U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    L = "abcdefghijklmnopqrstuvwxyz";
    N = "0123456789";
  }

  const sets = [];
  if (requireUpper) sets.push(U);
  if (requireLower) sets.push(L);
  if (requireNumber) sets.push(N);
  if (requireSymbol) sets.push(S);

  if (!sets.length) throw new Error("No character sets selected.");

  const ALL = sets.join("");
  const pick = (chars) => chars[secureRandomInt(chars.length)];

  // ensure at least one from each required set
  const result = sets.map(pick);

  // fill remaining
  for (let i = result.length; i < length; i++) result.push(pick(ALL));

  // Fisher–Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join("");
}

// crypto-backed random int (browser first, Node fallback)
function secureRandomInt(max) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const a = new Uint32Array(1);
    window.crypto.getRandomValues(a);
    return a[0] % max;
  }
  try {
    // Node
    const { randomInt } = require("crypto");
    return randomInt(0, max);
  } catch {
    // last resort (not recommended)
    return Math.floor(Math.random() * max);
  }
}
