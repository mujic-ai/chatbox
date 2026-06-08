import type { CallChatCompletionOptions } from '@shared/models/types'
import type { ModelDependencies } from '@shared/types/adapters'
import type { ProviderModelInfo } from '@shared/types/settings'
import type { SentryScope } from '@shared/utils/sentry_adapter'
import { describe, expect, it, vi } from 'vitest'
import DeepSeek from './deepseek'

class TestDeepSeek extends DeepSeek {
  public exposeCallSettings(options: CallChatCompletionOptions = {}) {
    return this.getCallSettings(options)
  }
}

function createDependencies(): ModelDependencies {
  return {
    request: {
      apiRequest: vi.fn(),
      fetchWithOptions: vi.fn(),
    },
    storage: {
      saveImage: vi.fn(),
      getImage: vi.fn(),
    },
    sentry: {
      captureException: vi.fn(),
      withScope: vi.fn((callback: (scope: SentryScope) => void) =>
        callback({
          setTag: vi.fn(),
          setExtra: vi.fn(),
        })
      ),
    },
    getRemoteConfig: vi.fn(),
    platformType: 'desktop',
  }
}

function createModel(overrides: Partial<ConstructorParameters<typeof DeepSeek>[0]> = {}) {
  const model: ProviderModelInfo = {
    modelId: 'deepseek-reasoner',
    type: 'chat',
    capabilities: ['reasoning', 'tool_use'],
  }

  return new TestDeepSeek(
    {
      apiKey: 'test-key',
      model,
      ...overrides,
    },
    createDependencies()
  )
}

describe('DeepSeek call settings', () => {
  it('keeps the default behavior (thinking enabled, no explicit effort) when not configured', () => {
    const deepseek = createModel()

    const settings = deepseek.exposeCallSettings()

    expect(settings.providerOptions).toEqual({
      deepseek: {
        thinking: { type: 'enabled' },
      },
    })
  })

  it('forwards reasoning_effort=high when the user selects "high"', () => {
    const deepseek = createModel()

    const settings = deepseek.exposeCallSettings({
      providerOptions: { deepseek: { reasoningEffort: 'high' } },
    })

    expect(settings.providerOptions).toEqual({
      deepseek: {
        thinking: { type: 'enabled' },
        reasoning_effort: 'high',
      },
    })
  })

  it('forwards reasoning_effort=max when the user selects "max"', () => {
    const deepseek = createModel()

    const settings = deepseek.exposeCallSettings({
      providerOptions: { deepseek: { reasoningEffort: 'max' } },
    })

    expect(settings.providerOptions).toEqual({
      deepseek: {
        thinking: { type: 'enabled' },
        reasoning_effort: 'max',
      },
    })
  })

  it('disables thinking when the user selects "disabled"', () => {
    const deepseek = createModel()

    const settings = deepseek.exposeCallSettings({
      providerOptions: { deepseek: { reasoningEffort: 'disabled' } },
    })

    expect(settings.providerOptions).toEqual({
      deepseek: {
        thinking: { type: 'disabled' },
      },
    })
  })

  it('omits temperature/topP for the reasoner model', () => {
    const deepseek = createModel({ temperature: 0.7, topP: 0.9 })

    const settings = deepseek.exposeCallSettings()

    expect(settings.temperature).toBeUndefined()
    expect(settings.topP).toBeUndefined()
  })

  it('keeps temperature/topP and skips thinking for non-reasoning models', () => {
    const deepseek = createModel({
      model: { modelId: 'deepseek-chat', type: 'chat', capabilities: ['tool_use'] },
      temperature: 0.7,
      topP: 0.9,
    })

    const settings = deepseek.exposeCallSettings()

    expect(settings.temperature).toBe(0.7)
    expect(settings.topP).toBe(0.9)
    expect(settings.providerOptions).toBeUndefined()
  })
})
