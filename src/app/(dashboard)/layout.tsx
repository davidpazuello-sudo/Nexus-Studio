import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'

async function getSeries() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/series`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const series = await getSeries()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        series={series}
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      {/* Conteúdo principal — deslocado pela largura da sidebar */}
      <main className="flex-1 ml-[220px] bg-white min-h-screen">
        {children}
      </main>
    </div>
  )
}
