/** Pure helper functions used by the UI. No React here, so they're easy to unit test. */

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/** 4400000 -> "₹44,00,000" (Indian lakh grouping). */
export const formatINR = (amount) => inr.format(Number(amount) || 0)

/** 4400000 -> "₹44 lakh", 12000000 -> "₹1.2 crore". Short form for tight spaces. */
export function shortINR(amount) {
  const n = Number(amount) || 0
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} crore`
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(1)} lakh`
  return formatINR(n)
}

/**
 * A stock number styled like an Indian number plate.
 * KA 20 is Udupi's RTO code; the letters come from the make.
 * plateFor({ id: 11, make: 'Toyota' }) -> "KA 20 TO 0011"
 */
export function plateFor({ id, make = '' }) {
  const letters = (make.replace(/[^a-z]/gi, '').slice(0, 2) || 'XX').toUpperCase().padEnd(2, 'X')
  return `KA 20 ${letters} ${String(id).padStart(4, '0')}`
}

// Common paint names -> a colour we can draw the car in.
const PAINTS = [
  ['turquoise', '#2AA59A'],
  ['teal', '#1E8A85'],
  ['pearl', '#F3F1EA'],
  ['white', '#F4F5F2'],
  ['black', '#202425'],
  ['obsidian', '#1B1F21'],
  ['silver', '#B9C0C2'],
  ['grey', '#7D8789'],
  ['gray', '#7D8789'],
  ['red', '#C8322E'],
  ['maroon', '#7A1F2B'],
  ['orange', '#E8732C'],
  ['yellow', '#F2C230'],
  ['gold', '#C9A54A'],
  ['green', '#2F7A4D'],
  ['lava blue', '#2563A8'],
  ['thunder', '#3C5FA8'],
  ['blue', '#2E5EA8'],
  ['brown', '#6B4A33'],
  ['beige', '#D8C8A8'],
]

/** "Attitude Black" -> "#202425". Unknown names fall back to the brand petrol colour. */
export function paintFor(colorName) {
  const name = (colorName || '').toLowerCase()
  const match = PAINTS.find(([word]) => name.includes(word))
  return match ? match[1] : '#2D6E70'
}

/** How the stock line should read and look. */
export function stockStatus(quantity) {
  if (quantity <= 0) return { label: 'Sold out', tone: 'out' }
  if (quantity === 1) return { label: 'Last one on the lot', tone: 'low' }
  if (quantity <= 3) return { label: `Only ${quantity} left`, tone: 'low' }
  return { label: `${quantity} on the lot`, tone: 'ok' }
}

/** Mix a hex colour toward white (amount > 0) or black (amount < 0). */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const channels = [n >> 16, (n >> 8) & 255, n & 255]
  const target = amount > 0 ? 255 : 0
  const t = Math.abs(amount)
  const mixed = channels.map((c) => Math.round(c + (target - c) * t))
  return '#' + mixed.map((c) => c.toString(16).padStart(2, '0')).join('')
}
