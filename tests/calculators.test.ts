import { describe, expect, it } from 'vitest'
import {
  cac,
  churnRate,
  grossMargin,
  ltv,
  mrr,
  paybackMonths,
  priceForMargin,
  runwayMonths,
  safeOwnership,
} from '@/lib/calculators'

describe('safe ownership', () => {
  it('converts an investment at a post-money cap', () => {
    expect(safeOwnership(500_000, 10_000_000)).toBeCloseTo(0.05, 6)
  })

  it('returns null for a zero or negative cap', () => {
    expect(safeOwnership(500_000, 0)).toBeNull()
    expect(safeOwnership(500_000, -1)).toBeNull()
  })

  it('returns null for negative investment', () => {
    expect(safeOwnership(-1, 10_000_000)).toBeNull()
  })

  it('handles zero investment as zero ownership', () => {
    expect(safeOwnership(0, 10_000_000)).toBe(0)
  })
})

describe('pricing', () => {
  it('finds the price for a 70% margin on a 12 unit cost', () => {
    expect(priceForMargin(12, 0.7)).toBeCloseTo(40, 6)
  })

  it('rejects a 100% margin', () => {
    expect(priceForMargin(12, 1)).toBeNull()
    expect(priceForMargin(12, 1.2)).toBeNull()
  })

  it('round-trips the gross margin', () => {
    expect(grossMargin(40, 12)).toBeCloseTo(0.7, 6)
  })

  it('rejects a cost above the price', () => {
    expect(grossMargin(10, 12)).toBeNull()
  })
})

describe('runway', () => {
  it('divides cash by burn', () => {
    expect(runwayMonths(20_000, 2_500)).toBe(8)
  })

  it('returns null without a burn rate', () => {
    expect(runwayMonths(20_000, 0)).toBeNull()
  })
})

describe('unit economics', () => {
  it('computes CAC from spend and customers', () => {
    expect(cac(1_000, 20)).toBe(50)
  })

  it('computes a simple LTV', () => {
    expect(ltv(29, 0.05)).toBeCloseTo(580, 6)
  })

  it('computes payback months', () => {
    expect(paybackMonths(50, 29)).toBeCloseTo(1.724, 3)
  })

  it('computes churn and MRR', () => {
    expect(churnRate(2, 40)).toBe(0.05)
    expect(mrr(29, 100)).toBe(2900)
  })

  it('rejects impossible churn and customer counts', () => {
    expect(churnRate(5, 4)).toBeNull()
    expect(churnRate(1, 0)).toBeNull()
    expect(cac(100, 0)).toBeNull()
    expect(ltv(10, 0)).toBeNull()
    expect(paybackMonths(10, 0)).toBeNull()
  })
})
