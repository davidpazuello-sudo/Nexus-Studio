// Utilitários obrigatórios para TODA chamada de IA no Nexus Studio
// Regra: nunca chamar Claude/GPT/Gemini sem withTimeout + withRetry + parseJsonSafe

// ── withTimeout ──────────────────────────────────────────

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30_000,
  errorMessage: string = 'Tempo limite da IA excedido. Tente novamente.'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  )
  return Promise.race([promise, timeout])
}

// ── withRetry ────────────────────────────────────────────

type RetryOptions = {
  attempts?: number
  delayMs?: number
  onRetry?: (attempt: number, error: unknown) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { attempts = 3, delayMs = 1_000, onRetry } = options

  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < attempts - 1) {
        onRetry?.(i + 1, error)
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }
  throw lastError
}

// ── parseJsonSafe ─────────────────────────────────────────

export function parseJsonSafe<T>(
  text: string,
  fallback: T
): T {
  try {
    // Remove blocos de código markdown se presentes (```json ... ```)
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

// ── Combinação padrão ─────────────────────────────────────

export async function callAI<T>(
  fn: () => Promise<T>,
  options: RetryOptions & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 60_000, ...retryOptions } = options
  return withRetry(() => withTimeout(fn(), timeoutMs), retryOptions)
}
