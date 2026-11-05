import { CLAIMS } from '@/content/generated/claims'
import { SOURCES } from '@/content/generated/sources'
import type { Claim, Source } from '@/content/schema'
import { todayIso } from '@/lib/dates'

export const claims: Claim[] = CLAIMS
export const sources: Source[] = SOURCES

const claimById = new Map(claims.map((claim) => [claim.id, claim]))
const sourceById = new Map(sources.map((source) => [source.id, source]))

export function getClaim(id: string): Claim | undefined {
  return claimById.get(id)
}

export function getSource(id: string): Source | undefined {
  return sourceById.get(id)
}

export function sourcesForClaim(claim: Claim): Source[] {
  return claim.sourceIds
    .map((id) => sourceById.get(id))
    .filter((source): source is Source => Boolean(source))
}

export function isStale(claim: Claim, today = todayIso()): boolean {
  return claim.reviewAfter < today
}
