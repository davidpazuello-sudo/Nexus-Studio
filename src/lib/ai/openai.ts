// Cliente OpenAI (GPT-4o) — instância singleton
// Uso: sempre via callAI() de utils.ts

import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada')
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

// Modelo padrão para geração de roteiro
export const OPENAI_MODEL = 'gpt-4o' as const
