/**
 * Small, testable formulas for the startup tools.
 * Every function returns null for input that would produce a meaningless number.
 */

export function safeOwnership(investment: number, postMoneyCap: number): number | null {
  if (!Number.isFinite(investment) || !Number.isFinite(postMoneyCap)) return null
  if (investment < 0 || postMoneyCap <= 0) return null
  return investment / postMoneyCap
}

export function priceForMargin(cost: number, margin: number): number | null {
  if (!Number.isFinite(cost) || !Number.isFinite(margin)) return null
  if (cost < 0 || margin < 0 || margin >= 1) return null
  return cost / (1 - margin)
}

export function grossMargin(price: number, cost: number): number | null {
  if (!Number.isFinite(price) || !Number.isFinite(cost)) return null
  if (price <= 0 || cost < 0 || cost > price) return null
  return (price - cost) / price
}

export function runwayMonths(cash: number, monthlyBurn: number): number | null {
  if (!Number.isFinite(cash) || !Number.isFinite(monthlyBurn)) return null
  if (cash < 0 || monthlyBurn <= 0) return null
  return cash / monthlyBurn
}

export function cac(spend: number, customers: number): number | null {
  if (!Number.isFinite(spend) || !Number.isFinite(customers)) return null
  if (spend < 0 || customers <= 0) return null
  return spend / customers
}

export function churnRate(churned: number, startingCustomers: number): number | null {
  if (!Number.isFinite(churned) || !Number.isFinite(startingCustomers)) return null
  if (churned < 0 || startingCustomers <= 0 || churned > startingCustomers) return null
  return churned / startingCustomers
}

export function ltv(monthlyRevenuePerUser: number, monthlyChurn: number): number | null {
  if (!Number.isFinite(monthlyRevenuePerUser) || !Number.isFinite(monthlyChurn)) return null
  if (monthlyRevenuePerUser < 0 || monthlyChurn <= 0 || monthlyChurn > 1) return null
  return monthlyRevenuePerUser / monthlyChurn
}

export function paybackMonths(cacValue: number, monthlyRevenuePerUser: number): number | null {
  if (!Number.isFinite(cacValue) || !Number.isFinite(monthlyRevenuePerUser)) return null
  if (cacValue < 0 || monthlyRevenuePerUser <= 0) return null
  return cacValue / monthlyRevenuePerUser
}

export function mrr(monthlyPrice: number, subscribers: number): number | null {
  if (!Number.isFinite(monthlyPrice) || !Number.isFinite(subscribers)) return null
  if (monthlyPrice < 0 || subscribers < 0) return null
  return monthlyPrice * subscribers
}

export function money(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(value)
}

export function percent(value: number, digits = 1): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    maximumFractionDigits: digits,
  }).format(value)
}
