import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 p-8 text-center">
        <span className="text-4xl">🔒</span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Acesso negado</h1>
          <p className="text-sm text-gray-500">
            Seu email não tem acesso ao Nexus Studio.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/login">Voltar para o login</Link>
        </Button>
      </div>
    </div>
  )
}
