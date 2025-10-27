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




// export function generatePassword() {
//   var length = 8,
//     charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
//     retVal = "";
//   for (var i = 0, n = charset.length; i < length; ++i) {
//     retVal += charset.charAt(Math.floor(Math.random() * n));
//   }
//   return retVal;
// }




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





// crypto-safe int in [0, max)
function secureRandomInt1(max) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return x % max;
  }
  // Fallback (Node.js)
  try {
    const { randomInt } = require("node:crypto");
    return randomInt(0, max);
  } catch {
    // Final fallback (not crypto-safe)
    return Math.floor(Math.random() * max);
  }
}

export function generatePassword(length = 8) {
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const DIGITS = "0123456789";
  const SPECIAL = "$#!&"; // only these specials

  if (length < 2) throw new Error("length must be at least 2");

  const ALL = LOWER + UPPER + DIGITS + SPECIAL;

  // Ensure at least one digit and one special
  const out = [
    DIGITS[secureRandomInt1(DIGITS.length)],
    SPECIAL[secureRandomInt1(SPECIAL.length)],
  ];

  // Fill the rest
  for (let i = out.length; i < length; i++) {
    out.push(ALL[secureRandomInt1(ALL.length)]);
  }

  // Fisher–Yates shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = secureRandomInt1(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out.join("");
}
