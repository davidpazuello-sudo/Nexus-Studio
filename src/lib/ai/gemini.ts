// Cliente Google Gemini Flash — instância singleton
// Uso: divisão em cenas (janela de contexto grande)
// Uso: sempre via callAI() de utils.ts

import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada')
    }
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return _client
}

// Modelo com janela grande para divisão de cenas
export const GEMINI_MODEL = 'gemini-1.5-flash' as const
