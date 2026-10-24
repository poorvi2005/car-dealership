import { describe, expect, it } from 'vitest'
import { formatINR, paintFor, plateFor, shade, shortINR, stockStatus } from '../utils/format'

describe('formatINR', () => {
  it('uses Indian lakh grouping', () => {
    expect(formatINR(4400000)).toBe('₹44,00,000')
  })
  it('treats bad input as zero', () => {
    expect(formatINR(undefined)).toBe('₹0')
  })
})

describe('shortINR', () => {
  it('shows lakh and crore', () => {
    expect(shortINR(4400000)).toBe('₹44 lakh')
    expect(shortINR(12000000)).toBe('₹1.2 crore')
  })
})

describe('plateFor', () => {
  it('builds a Karnataka-style plate from make and id', () => {
    expect(plateFor({ id: 11, make: 'Toyota' })).toBe('KA 20 TO 0011')
  })
  it('ignores punctuation and pads short makes', () => {
    expect(plateFor({ id: 3, make: 'M-G' })).toBe('KA 20 MG 0003')
    expect(plateFor({ id: 3, make: '' })).toBe('KA 20 XX 0003')
  })
})

describe('paintFor', () => {
  it('matches paint names case-insensitively', () => {
    expect(paintFor('Attitude BLACK')).toBe('#202425')
    expect(paintFor('Turquoise Green')).toBe('#2AA59A') // turquoise wins over green
  })
  it('falls back for unknown or missing colours', () => {
    expect(paintFor('Unobtainium')).toBe('#2D6E70')
    expect(paintFor(null)).toBe('#2D6E70')
  })
})

describe('stockStatus', () => {
  it.each([
    [0, 'Sold out', 'out'],
    [1, 'Last one on the lot', 'low'],
    [3, 'Only 3 left', 'low'],
    [9, '9 on the lot', 'ok'],
  ])('quantity %i -> %s', (qty, label, tone) => {
    expect(stockStatus(qty)).toEqual({ label, tone })
  })
})

describe('shade', () => {
  it('mixes toward white and black', () => {
    expect(shade('#000000', 1)).toBe('#ffffff')
    expect(shade('#ffffff', -1)).toBe('#000000')
    expect(shade('#808080', 0)).toBe('#808080')
  })
})
