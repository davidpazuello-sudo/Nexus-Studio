import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSeriesSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  premise: z.string().optional(),
  tone: z.string().optional(),
  ageTarget: z.string().optional(),
  vocabulary: z.string().optional(),
  visualStyle: z.string().optional(),
  worldRules: z.string().optional(),
  seasonArc: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const series = await prisma.series.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { episodes: true, characters: true } },
      },
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('GET /api/series:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createSeriesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const series = await prisma.series.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.error('POST /api/series:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
