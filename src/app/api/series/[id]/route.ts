import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSeriesSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  premise: z.string().optional().nullable(),
  tone: z.string().optional().nullable(),
  ageTarget: z.string().optional().nullable(),
  vocabulary: z.string().optional().nullable(),
  visualStyle: z.string().optional().nullable(),
  worldRules: z.string().optional().nullable(),
  seasonArc: z.string().optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const series = await prisma.series.findFirst({
      where: { id: params.id, createdById: session.user.id },
      include: {
        characters: { orderBy: { name: 'asc' } },
        _count: { select: { episodes: true, characters: true } },
      },
    })

    if (!series) {
      return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 })
    }

    return NextResponse.json(series)
  } catch (error) {
    console.error('GET /api/series/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSeriesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.series.updateMany({
      where: { id: params.id, createdById: session.user.id },
      data: parsed.data,
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 })
    }

    const series = await prisma.series.findUnique({ where: { id: params.id } })
    return NextResponse.json(series)
  } catch (error) {
    console.error('PATCH /api/series/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const series = await prisma.series.findFirst({
      where: { id: params.id, createdById: session.user.id },
    })
    if (!series) {
      return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 })
    }

    // Deletar na ordem correta para evitar FK constraints
    await prisma.$transaction([
      prisma.character.deleteMany({ where: { seriesId: params.id } }),
      prisma.episode.deleteMany({ where: { seriesId: params.id } }),
      prisma.series.delete({ where: { id: params.id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/series/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
