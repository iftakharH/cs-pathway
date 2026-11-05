import { z } from 'zod'

/**
 * Content schemas. These are shared by the build-time validator and the app.
 * Rules that need cross-record knowledge (source tiers, references) live in
 * `scripts/lib/content-checks.ts`, because a single schema cannot see them.
 */

const idString = z.string().min(2).max(80)
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
const httpsUrl = z.url().refine((value) => value.startsWith('https://'), {
  message: 'Use an https:// URL',
})

export const PhaseIdSchema = z.enum(['F', '1', '2', '3', 'S'])
export type PhaseId = z.infer<typeof PhaseIdSchema>

export const SourceTierSchema = z.enum(['primary', 'secondary', 'community'])
export type SourceTier = z.infer<typeof SourceTierSchema>

export const SourceSchema = z.strictObject({
  id: idString,
  title: z.string().min(3).max(200),
  publisher: z.string().min(2).max(120),
  url: httpsUrl,
  tier: SourceTierSchema,
  publishedAt: dateString.optional(),
  retrievedAt: dateString,
  note: z.string().max(400).optional(),
})
export type Source = z.infer<typeof SourceSchema>

export const ClaimKindSchema = z.enum(['observed-data', 'spec-fact', 'forecast', 'editorial'])
export type ClaimKind = z.infer<typeof ClaimKindSchema>

export const ClaimSchema = z.strictObject({
  id: z.string().regex(/^[A-Z]\d+[a-z]?$/, 'Claim ids look like C1, S2, V1'),
  statement: z.string().min(10).max(900),
  kind: ClaimKindSchema,
  confidence: z.enum(['high', 'medium', 'low']),
  sourceIds: z.array(idString).max(6),
  scope: z.string().min(3).max(240),
  verifiedAt: dateString,
  reviewAfter: dateString,
  /** Required for forecasts: who made the forecast. */
  forecastBy: z.string().max(160).optional(),
  /** Required for forecasts: what evidence would prove it wrong. */
  falsifiedBy: z.string().max(300).optional(),
  phase: PhaseIdSchema.optional(),
  topics: z.array(z.string().max(40)).max(6).optional(),
})
export type Claim = z.infer<typeof ClaimSchema>

export const ResourceSchema = z.strictObject({
  title: z.string().min(3).max(160),
  publisher: z.string().min(2).max(120),
  url: httpsUrl,
  format: z.enum(['docs', 'course', 'book', 'video', 'article', 'repository', 'tool']),
  price: z.enum(['free', 'freemium', 'paid']),
  lastVerifiedAt: dateString,
  officialVendor: z.boolean(),
  why: z.string().min(10).max(300),
})
export type Resource = z.infer<typeof ResourceSchema>

export const QuizQuestionSchema = z
  .strictObject({
    id: idString,
    question: z.string().min(10).max(400),
    choices: z.array(z.string().min(1).max(200)).min(3).max(5),
    answerIndex: z.number().int().min(0).max(4),
    explanation: z.string().min(20).max(600),
    /** A page that states the answer, not a search result. */
    sourceUrl: httpsUrl,
    sourceClaimId: idString.optional(),
  })
  .refine((q) => q.answerIndex < q.choices.length, {
    message: 'answerIndex must point at an existing choice',
    path: ['answerIndex'],
  })
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>

const RubricLevelSchema = z.strictObject({
  0: z.string().min(5).max(240),
  1: z.string().min(5).max(240),
  2: z.string().min(5).max(240),
  3: z.string().min(5).max(240),
})

export const RubricCriterionSchema = z.strictObject({
  criterion: z.string().min(5).max(160),
  levels: RubricLevelSchema,
})
export type RubricCriterion = z.infer<typeof RubricCriterionSchema>

export const ProofSchema = z.strictObject({
  title: z.string().min(5).max(160),
  brief: z.string().min(30).max(1200),
  /** What a reviewer should look for, in one line. */
  evidence: z.string().min(10).max(300),
  rubric: z.array(RubricCriterionSchema).min(3).max(6),
})
export type Proof = z.infer<typeof ProofSchema>

export const ModuleSchema = z
  .strictObject({
    id: idString,
    phase: PhaseIdSchema,
    order: z.number().int().min(1).max(99),
    title: z.string().min(4).max(120),
    summary: z.string().min(30).max(400),
    objectives: z.array(z.string().min(10).max(220)).min(3).max(6),
    prerequisites: z.array(idString).max(6),
    estHours: z.strictObject({ min: z.number().min(0.5).max(80), max: z.number().min(0.5).max(120) }),
    claimIds: z.array(idString).max(8),
    resources: z.array(ResourceSchema).min(2).max(8),
    cheatsheetIds: z.array(idString).max(20),
    quiz: z.array(QuizQuestionSchema).min(5).max(10),
    proof: ProofSchema,
    playbookIds: z.array(idString).max(8),
    /** Short, concrete reason this module exists. Personal edit, no invented data. */
    whyItMatters: z.string().min(20).max(500),
    /** One honest risk note, required in the startup phase. */
    riskNote: z.string().max(400).optional(),
  })
  .refine((m) => m.estHours.min <= m.estHours.max, {
    message: 'estHours.min must be <= estHours.max',
    path: ['estHours', 'min'],
  })
export type Module = z.infer<typeof ModuleSchema>

export const SnippetSchema = z.strictObject({
  lang: z.enum([
    'bash',
    'js',
    'ts',
    'tsx',
    'python',
    'sql',
    'json',
    'yaml',
    'http',
    'dockerfile',
    'ini',
    'toml',
    'html',
    'css',
    'text',
  ]),
  code: z.string().min(3).max(4000),
  caption: z.string().min(5).max(160),
  runnable: z.boolean(),
  /** `executed` means CI ran it; `docs` means checked against official docs. */
  checked: z.enum(['executed', 'docs']),
  /** Required for executable snippets: the exact stdout the program must print. */
  expectStdout: z.string().max(1000).optional(),
  /** Required for executable SQL: the exact rows the final query must return. */
  expectRows: z.array(z.array(z.unknown())).max(50).optional(),
})
export type Snippet = z.infer<typeof SnippetSchema>

export const ToolStampSchema = z.strictObject({
  name: z.string().min(2).max(60),
  version: z.string().min(1).max(40),
  verifiedOn: dateString,
})
export type ToolStamp = z.infer<typeof ToolStampSchema>

export const CheatEntrySchema = z
  .strictObject({
    id: idString,
    phase: PhaseIdSchema,
    topic: z.string().min(2).max(40),
    title: z.string().min(4).max(120),
    whenToUse: z.string().min(15).max(260),
    snippets: z.array(SnippetSchema).min(1).max(3),
    notes: z.array(z.string().min(5).max(300)).max(5),
    gotchas: z.array(z.string().min(5).max(300)).max(3),
    seeAlso: z.array(idString).max(4),
    tool: ToolStampSchema,
    sourceUrl: httpsUrl,
    tags: z.array(z.string().min(2).max(30)).min(1).max(8),
  })
  .refine(
    (entry) =>
      entry.snippets.every((s) => {
        if (!s.runnable) return true
        if (s.checked !== 'executed') return false
        return s.lang === 'sql' ? Boolean(s.expectRows) : Boolean(s.expectStdout)
      }),
    {
      message:
        'A runnable snippet must be checked: executed and declare expectStdout (or expectRows for SQL)',
      path: ['snippets'],
    },
  )
export type CheatEntry = z.infer<typeof CheatEntrySchema>

/** Lightweight records used by the landing page, path, planner and dashboard. */
export type ModuleSummary = Pick<
  Module,
  'id' | 'phase' | 'order' | 'title' | 'summary' | 'estHours' | 'prerequisites' | 'cheatsheetIds'
> & {
  quizCount: number
  proofTitle: string
  proofBrief: string
}

export type CheatIndexEntry = Pick<
  CheatEntry,
  'id' | 'phase' | 'topic' | 'title' | 'whenToUse' | 'tags' | 'tool' | 'sourceUrl'
>

export type Catalog = {
  modules: ModuleSummary[]
  cheatsheets: CheatIndexEntry[]
  featuredCheat: CheatEntry
}

export const PlaybookToolSchema = z.strictObject({
  name: z.string().min(2).max(80),
  what: z.string().min(15).max(240),
  install: z.string().max(240).optional(),
  licence: z.string().max(60).optional(),
  officialVendor: z.boolean(),
  verified: z.boolean(),
  verifiedOn: dateString,
  sourceUrl: httpsUrl,
})
export type PlaybookTool = z.infer<typeof PlaybookToolSchema>

export const PlaybookEntrySchema = z.strictObject({
  id: idString,
  task: z.string().min(5).max(100),
  summary: z.string().min(30).max(400),
  risk: z.enum(['low', 'medium', 'high']),
  tools: z.array(PlaybookToolSchema).min(1).max(6),
  agentsMd: z.string().max(2000).optional(),
  starterPrompt: z.string().min(20).max(1600),
  checklist: z.array(z.string().min(5).max(200)).min(2).max(8),
  pitfalls: z.array(z.string().min(5).max(240)).min(1).max(5),
  phase: PhaseIdSchema.optional(),
})
export type PlaybookEntry = z.infer<typeof PlaybookEntrySchema>

export const HarnessSchema = z.strictObject({
  id: idString,
  name: z.string().min(2).max(60),
  vendor: z.string().min(2).max(60),
  url: httpsUrl,
  pricingUrl: httpsUrl,
  skills: z.enum(['native', 'partial', 'none']),
  mcp: z.enum(['native', 'partial', 'none']),
  agentsMd: z.enum(['native', 'partial', 'none']),
  status: z.enum(['active', 'legacy', 'preview']).default('active'),
  skillsUrl: httpsUrl.optional(),
  mcpUrl: httpsUrl.optional(),
  agentsMdUrl: httpsUrl.optional(),
  skillsPath: z.string().min(2).max(200).optional(),
  mcpConfig: z.string().min(2).max(200).optional(),
  agentsFile: z.string().min(2).max(200).optional(),
  quickstart: z.array(z.string().min(5).max(180)).min(3).max(5).optional(),
  limitations: z.array(z.string().min(5).max(240)).max(4).optional(),
  notes: z.string().min(20).max(400),
  verifiedOn: dateString,
})
export type Harness = z.infer<typeof HarnessSchema>

export const GlossaryTermSchema = z.strictObject({
  term: z.string().min(2).max(80),
  definition: z.string().min(20).max(500),
  sourceTitle: z.string().min(3).max(160),
  sourceUrl: httpsUrl,
})
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>

export const TrendSchema = z.strictObject({
  id: idString,
  level: z.enum(['observed', 'emerging', 'forecast']),
  title: z.string().min(5).max(140),
  body: z.string().min(40).max(900),
  claimIds: z.array(idString).min(1).max(6),
  falsifiedBy: z.string().max(300).optional(),
  phase: PhaseIdSchema.optional(),
})
export type Trend = z.infer<typeof TrendSchema>

export const PhaseSchema = z.strictObject({
  id: PhaseIdSchema,
  order: z.number().int().min(1).max(9),
  name: z.string().min(3).max(80),
  kicker: z.string().min(3).max(80),
  description: z.string().min(40).max(600),
  outcome: z.string().min(20).max(300),
  gate: z.string().min(20).max(300),
  proofSummary: z.string().min(20).max(300),
})
export type Phase = z.infer<typeof PhaseSchema>

export const SiteSchema = z.strictObject({
  name: z.string().min(2).max(40),
  tagline: z.string().min(10).max(160),
  ownerName: z.string().min(2).max(80),
  ownerUrl: httpsUrl,
  contactUrl: httpsUrl,
  repoUrl: httpsUrl.optional(),
  deployedUrl: httpsUrl,
  founded: dateString,
  statement: z.string().min(40).max(500),
})
export type Site = z.infer<typeof SiteSchema>

export const SourcesFileSchema = z.strictObject({ sources: z.array(SourceSchema).min(1) })
export const ClaimsFileSchema = z.strictObject({ claims: z.array(ClaimSchema).min(1) })
export const ModulesFileSchema = z.strictObject({ modules: z.array(ModuleSchema).min(1) })
export const CheatsheetsFileSchema = z.strictObject({ entries: z.array(CheatEntrySchema).min(1) })
export const PlaybookFileSchema = z.strictObject({ entries: z.array(PlaybookEntrySchema).min(1) })
export const HarnessesFileSchema = z.strictObject({ harnesses: z.array(HarnessSchema).min(1) })
export const GlossaryFileSchema = z.strictObject({ terms: z.array(GlossaryTermSchema).min(1) })
export const TrendsFileSchema = z.strictObject({ trends: z.array(TrendSchema).min(1) })
export const PhasesFileSchema = z.strictObject({ phases: z.array(PhaseSchema).min(1) })

export type Content = {
  site: Site
  phases: Phase[]
  sources: Source[]
  claims: Claim[]
  modules: Module[]
  cheatsheets: CheatEntry[]
  playbook: PlaybookEntry[]
  harnesses: Harness[]
  glossary: GlossaryTerm[]
  trends: Trend[]
}

export const BANNED_PHRASES = [
  'guaranteed',
  'get hired in',
  'secret',
  '10x',
  'passive income',
] as const
