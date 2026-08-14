import type { AIProvider } from '@/types/chat'
import { MockProvider } from './mock-provider'

/**
 * Engine factory.
 *
 * SWAP POINT: adding a real model means implementing AIProvider in a new file
 * and returning it here when AI_PROVIDER says so. No component, route or
 * service changes — they all consume the same ChatMessage contract.
 *
 * Reads configuration from the environment; never contains credentials.
 */
export function getAIProvider(): AIProvider {
  const configured = (process.env.AI_PROVIDER ?? 'mock').toLowerCase()

  switch (configured) {
    case 'mock':
      return new MockProvider()

    // case 'openai':
    //   return new OpenAIProvider({
    //     apiKey: requireEnv('AI_API_KEY'),
    //     model: process.env.AI_MODEL ?? 'gpt-4o-mini',
    //   })

    default:
      // Unknown provider: fail safe to the offline engine rather than erroring.
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[connex] Unknown AI_PROVIDER "${configured}" — falling back to the mock engine.`
        )
      }
      return new MockProvider()
  }
}
