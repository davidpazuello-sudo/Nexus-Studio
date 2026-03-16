import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'

async function getSeries(userId: string) {
  try {
    return await prisma.series.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { episodes: true, characters: true } },
      },
    })
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

  const series = await getSeries(session.user.id)

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
