import type { CardBrand } from "@/store/payments";

/** Detect the card brand from the leading digits of a card number. */
export function detectBrand(digits: string): CardBrand {
  if (digits.startsWith("4")) return "visa";
  const two = Number(digits.slice(0, 2));
  if (digits.length >= 2 && two >= 51 && two <= 55) return "mastercard";
  if (digits.startsWith("34") || digits.startsWith("37")) return "amex";
  if (
    digits.startsWith("60") ||
    digits.startsWith("65") ||
    digits.startsWith("81")
  )
    return "rupay";
  return "card";
}

/**
 * Strip non-digits, cap at 16 digits (15 for Amex) and group with spaces:
 * "4 4 4 4" for most brands, "4 6 5" for Amex.
 */
export function formatCardNumber(raw: string): string {
  const all = raw.replace(/\D/g, "");
  const brand = detectBrand(all);
  if (brand === "amex") {
    const digits = all.slice(0, 15);
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return all.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Strip the grouping spaces from a formatted card number. */
export function cardDigits(formatted: string): string {
  return formatted.replace(/\s+/g, "");
}

/**
 * Format an expiry as "MM / YY" while typing: digits only, capped at 4,
 * a first digit above 1 becomes "0X", month clamped to 01-12 and " / "
 * auto-inserted after the month. When the user deletes the separator the
 * bare month digits are kept so backspace works naturally.
 */
export function formatExpiry(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits && Number(digits[0]) > 1) digits = `0${digits}`;
  digits = digits.slice(0, 4);
  if (digits.length < 2) return digits;
  let month = Number(digits.slice(0, 2));
  if (month < 1) month = 1;
  if (month > 12) month = 12;
  const mm = String(month).padStart(2, "0");
  const rest = digits.slice(2);
  if (rest.length === 0 && /\D$/.test(raw)) return mm;
  return `${mm} / ${rest}`;
}

/** Parse "MM / YY" (or "MM/YY") into a month and 2000-based full year. */
export function parseExpiry(v: string): { month: number; year: number } | null {
  const m = /^\s*(\d{2})\s*\/\s*(\d{2})\s*$/.exec(v);
  if (!m) return null;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return null;
  return { month, year: 2000 + Number(m[2]) };
}

/** Length check (15 for Amex, 16 otherwise) plus the Luhn checksum. */
export function isValidCardNumber(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  const expected = detectBrand(digits) === "amex" ? 15 : 16;
  if (digits.length !== expected) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits.charCodeAt(digits.length - 1 - i) - 48;
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** True while the card is still valid — end of the expiry month, inclusive. */
export function isFutureExpiry(month: number, year: number): boolean {
  const now = new Date();
  // Day 0 of the next month = last day of the expiry month.
  return new Date(year, month, 0, 23, 59, 59, 999).getTime() >= now.getTime();
}
