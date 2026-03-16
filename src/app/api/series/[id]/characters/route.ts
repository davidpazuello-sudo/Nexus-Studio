import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const characterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  age: z.string().optional().nullable(),
  personality: z.string().min(1, 'Personalidade é obrigatória'),
  speakStyle: z.string().min(1, 'Estilo de fala é obrigatório'),
  motivations: z.string().optional().nullable(),
  restrictions: z.string().optional().nullable(),
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
    })
    if (!series) {
      return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 })
    }

    const characters = await prisma.character.findMany({
      where: { seriesId: params.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(characters)
  } catch (error) {
    console.error('GET /api/series/[id]/characters:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
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

    const body = await request.json()
    const parsed = characterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const character = await prisma.character.create({
      data: { ...parsed.data, seriesId: params.id },
    })

    return NextResponse.json(character, { status: 201 })
  } catch (error) {
    console.error('POST /api/series/[id]/characters:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
