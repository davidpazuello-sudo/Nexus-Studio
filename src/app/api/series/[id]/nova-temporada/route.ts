import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

function parseSeasonTitle(title: string): { showName: string; season: number } {
  const match = title.match(/^(.+?)\s*[\u2014\u2013-]\s*Temporada\s+(\d+)$/i)
  if (match) return { showName: match[1].trim(), season: parseInt(match[2]) }
  return { showName: title, season: 1 }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const series = await prisma.series.findUnique({
    where: { id: params.id },
    include: { characters: true },
  })

  if (!series) return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 })
  if (series.createdById !== session.user.id) return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  const parsed = parseSeasonTitle(series.title)
  const newTitle = `${parsed.showName} — Temporada ${parsed.season + 1}`

  const newSeries = await prisma.series.create({
    data: {
      title: newTitle,
      status: 'ACTIVE' as const,
      tone: series.tone,
      ageTarget: series.ageTarget,
      vocabulary: series.vocabulary,
      visualStyle: series.visualStyle,
      worldRules: series.worldRules,
      createdById: session.user.id,
    },
  })

  if (series.characters.length > 0) {
    await prisma.character.createMany({
      data: series.characters.map((c) => ({
        name: c.name,
        role: c.role,
        description: c.description,
        age: c.age,
        traits: c.traits,
        seriesId: newSeries.id,
      })),
    })
  }

  return NextResponse.json(newSeries)
}