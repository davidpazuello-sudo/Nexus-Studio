import Link from 'next/link'
import { BookOpen, Film, Users, Plus } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CreateSeriesDialog } from '@/components/series/create-series-dialog'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  COMPLETED: 'ConcluÃ­da',
}

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'muted'> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'muted',
}

async function getSeries(userId: string) {
  return prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { episodes: true, characters: true } },
    },
  })
}

export default async function SeriesPage() {
  const session = await auth()
  const series = await getSeries(session!.user.id)

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-5">Nexus Studio / SÃ©ries</p>

      {/* CabeÃ§alho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SÃ©ries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {series.length === 0
              ? 'Nenhuma sÃ©rie criada ainda'
              : `${series.length} sÃ©rie${series.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <CreateSeriesDialog />
      </div>

      {/* Lista */}
      {series.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-[#D4EDE3] flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-[#1A6B35]" />
          </div>
          <h3 className="text-base font-medium text-gray-700 mb-1">
            Nenhuma sÃ©rie ainda
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Crie a primeira sÃ©rie para comeÃ§ar a produzir.
          </p>
          <CreateSeriesDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <Link key={s.id} href={`/series/${s.id}`}>
              <Card className="hover:border-[#1A6B35]/40 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                      {s.title}
                    </h2>
                    <Badge variant={STATUS_VARIANTS[s.status]} className="shrink-0">
                      {STATUS_LABELS[s.status]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto">
                    <span className="flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      {s._count.episodes} episÃ³dio{s._count.episodes !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {s._count.characters} personagem{s._count.characters !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
