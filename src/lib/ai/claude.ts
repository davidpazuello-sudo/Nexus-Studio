// Cliente Anthropic (Claude) — instância singleton
// Uso: sempre via callAI() de utils.ts

import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY não configurada')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Modelo padrão para geração de roteiro
export const CLAUDE_MODEL = 'claude-opus-4-6' as const
