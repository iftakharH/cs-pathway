import { describe, expect, it } from 'vitest'
import { loadContent } from '../scripts/lib/load-content'

const { content, errors } = loadContent()

describe('content integrity', () => {
  it('loads without validation errors', () => {
    expect(errors).toEqual([])
    expect(content).not.toBeNull()
  })

  it('keeps every claim sourced or explicitly editorial', () => {
    for (const claim of content?.claims ?? []) {
      if (claim.kind === 'editorial') continue
      expect(claim.sourceIds.length, `${claim.id} has no source`).toBeGreaterThan(0)
    }
  })

  it('uses the corrected source-attribution figure, not the brief figure', () => {
    const claim = content?.claims.find((item) => item.id === 'C4')
    expect(claim?.statement).toContain('93%')
    expect(claim?.statement).not.toContain('78.7')
  })

  it('gives every module a free resource, an official resource and five sourced questions', () => {
    for (const module of content?.modules ?? []) {
      expect(module.quiz.length, module.id).toBeGreaterThanOrEqual(5)
      expect(module.resources.some((resource) => resource.price === 'free'), module.id).toBe(true)
      expect(module.resources.some((resource) => resource.officialVendor), module.id).toBe(true)
      expect(module.proof.rubric.length, module.id).toBeGreaterThanOrEqual(3)
      expect(module.objectives.length, module.id).toBeGreaterThanOrEqual(3)
      for (const question of module.quiz) {
        expect(question.answerIndex).toBeLessThan(question.choices.length)
        expect(question.sourceUrl.startsWith('https://')).toBe(true)
      }
    }
  })

  it('requires an expectation for every executable snippet', () => {
    for (const entry of content?.cheatsheets ?? []) {
      for (const snippet of entry.snippets) {
        if (!snippet.runnable) continue
        expect(snippet.checked, `${entry.id} is not marked executed`).toBe('executed')
        if (snippet.lang === 'sql') {
          expect(snippet.expectRows, `${entry.id} has no expectRows`).toBeDefined()
        } else {
          expect(snippet.expectStdout, `${entry.id} has no expectStdout`).toBeDefined()
        }
      }
    }
  })

  it('keeps review dates after verification dates', () => {
    for (const claim of content?.claims ?? []) {
      expect(claim.reviewAfter >= claim.verifiedAt, claim.id).toBe(true)
    }
  })

  it('links every cheatsheet to an https source and a tool version', () => {
    for (const entry of content?.cheatsheets ?? []) {
      expect(entry.sourceUrl.startsWith('https://'), entry.id).toBe(true)
      expect(entry.tool.version.length, entry.id).toBeGreaterThan(0)
      expect(entry.snippets.length, entry.id).toBeGreaterThan(0)
    }
  })

  it('has no duplicate ids in any collection', () => {
    const collections = [
      content?.sources.map((item) => item.id) ?? [],
      content?.claims.map((item) => item.id) ?? [],
      content?.modules.map((item) => item.id) ?? [],
      content?.cheatsheets.map((item) => item.id) ?? [],
      content?.playbook.map((item) => item.id) ?? [],
      content?.harnesses.map((item) => item.id) ?? [],
    ]
    for (const ids of collections) {
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('keeps the harness comparison complete and documented', () => {
    const harnesses = content?.harnesses ?? []
    expect(harnesses).toHaveLength(6)
    for (const harness of harnesses) {
      expect(harness.skillsUrl, `${harness.id} skills docs`).toMatch(/^https:\/\//)
      expect(harness.mcpUrl, `${harness.id} MCP docs`).toMatch(/^https:\/\//)
      expect(harness.agentsMdUrl, `${harness.id} AGENTS.md docs`).toMatch(/^https:\/\//)
      expect(harness.verifiedOn, harness.id).toMatch(/^2026-11-06$/)
      expect(harness.notes.length, harness.id).toBeGreaterThan(20)
    }

    const gemini = harnesses.find((harness) => harness.id === 'gemini-cli')
    expect(gemini?.status).toBe('legacy')
    expect(gemini?.agentsMd).toBe('partial')

    const claude = harnesses.find((harness) => harness.id === 'claude-code')
    expect(claude?.agentsMd).toBe('partial')
  })

  it('maps every stamped tool to a manual or registry review', () => {
    const tools = [...new Set((content?.cheatsheets ?? []).map((entry) => entry.tool.name))]
    expect(tools.length).toBeGreaterThan(20)
    for (const tool of tools) {
      expect(tool.trim().length, tool).toBeGreaterThan(1)
    }
  })
})
