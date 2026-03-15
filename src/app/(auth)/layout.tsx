// Layout para rotas de autenticação — sem sidebar, tela cheia
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {children}
    </div>
  )
}
