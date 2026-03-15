import { redirect } from 'next/navigation'

// Redireciona a raiz para /series (requer autenticação via middleware)
export default function RootPage() {
  redirect('/series')
}
