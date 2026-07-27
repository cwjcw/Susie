import * as fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import logger from '@shared/logger'
import { buildSystemEnvPrompt } from '@/agent/deepchat/resources/systemEnvPromptBuilder'

function fileError(code: string): NodeJS.ErrnoException {
  return Object.assign(new Error(`${code} mock error`), { code })
}

describe('buildSystemEnvPrompt', () => {
  const missingWorkdir = path.resolve('/tmp/deepchat-env-prompt-missing')
  const presentWorkdir = path.resolve('/tmp/deepchat-env-prompt-present')
  const errorWorkdir = path.resolve('/tmp/deepchat-env-prompt-error')
  const slowWorkdir = path.resolve('/tmp/deepchat-env-prompt-slow')
  beforeEach(() => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.promises.readFile).mockReset()
    vi.mocked(logger.warn).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('omits instructions without warning when AGENTS.md is missing', async () => {
    vi.mocked(fs.promises.readFile).mockRejectedValue(fileError('ENOENT'))

    const prompt = await buildSystemEnvPrompt({
      workdir: missingWorkdir,
      providerId: 'provider',
      modelId: 'model',
      now: new Date('2026-06-22T00:00:00Z')
    })

    expect(prompt).toContain(`Working directory: ${missingWorkdir}`)
    expect(prompt).not.toContain('Instructions from:')
    expect(logger.warn).not.toHaveBeenCalledWith(
      '[SystemEnvPromptBuilder] Failed to read AGENTS.md',
      expect.anything()
    )
  })

  it('includes instructions when AGENTS.md exists', async () => {
    vi.mocked(fs.promises.readFile).mockResolvedValue('Use concise answers.\n')

    const prompt = await buildSystemEnvPrompt({
      workdir: presentWorkdir,
      providerId: 'provider',
      modelId: 'model',
      now: new Date('2026-06-22T00:00:00Z')
    })

    expect(prompt).toContain(`Instructions from: ${path.join(presentWorkdir, 'AGENTS.md')}`)
    expect(prompt).toContain('Use concise answers.')
  })

  it('logs lightweight metadata for real AGENTS.md read errors', async () => {
    vi.mocked(fs.promises.readFile).mockRejectedValue(fileError('EISDIR'))

    const prompt = await buildSystemEnvPrompt({
      workdir: errorWorkdir,
      providerId: 'provider',
      modelId: 'model',
      now: new Date('2026-06-22T00:00:00Z')
    })

    expect(prompt).not.toContain('Instructions from:')
    expect(logger.warn).toHaveBeenCalledWith('[SystemEnvPromptBuilder] Failed to read AGENTS.md', {
      sourcePath: path.join(errorWorkdir, 'AGENTS.md'),
      code: 'EISDIR',
      message: 'EISDIR mock error'
    })
  })

  it('defers slow first reads and reuses the late cached result', async () => {
    vi.useFakeTimers()
    let resolveRead: (content: string) => void = () => {}
    vi.mocked(fs.promises.readFile).mockReturnValue(
      new Promise<string>((resolve) => {
        resolveRead = resolve
      }) as ReturnType<typeof fs.promises.readFile>
    )

    const promptPromise = buildSystemEnvPrompt({
      workdir: slowWorkdir,
      providerId: 'provider',
      modelId: 'model',
      now: new Date('2026-06-22T00:00:00Z')
    })

    await vi.advanceTimersByTimeAsync(200)
    const prompt = await promptPromise

    expect(prompt).not.toContain('Instructions from:')
    expect(logger.warn).toHaveBeenCalledWith('[SystemEnvPromptBuilder] AGENTS.md read deferred', {
      sourcePath: path.join(slowWorkdir, 'AGENTS.md'),
      budgetMs: 200
    })

    resolveRead('Late instructions.\n')
    await Promise.resolve()
    await Promise.resolve()

    const cachedPrompt = await buildSystemEnvPrompt({
      workdir: slowWorkdir,
      providerId: 'provider',
      modelId: 'model',
      now: new Date('2026-06-22T00:00:00Z')
    })

    expect(cachedPrompt).toContain('Late instructions.')
    expect(fs.promises.readFile).toHaveBeenCalledTimes(1)
  })
})
