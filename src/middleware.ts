// Proteção de rotas — implementação completa no Módulo 1 (Auth)
// Por ora, exporta o middleware do NextAuth v5 após lib/auth.ts ser criado

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas — não requerem autenticação
const PUBLIC_ROUTES = ['/login', '/unauthorized']
const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon.ico']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Liberar rotas públicas e assets
  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isPublic) return NextResponse.next()

  // TODO (Módulo 1): Substituir por verificação de sessão NextAuth v5
  // Exemplo:
  //   const session = await auth()
  //   if (!session) return NextResponse.redirect(new URL('/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aplicar middleware em todas as rotas exceto arquivos estáticos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
