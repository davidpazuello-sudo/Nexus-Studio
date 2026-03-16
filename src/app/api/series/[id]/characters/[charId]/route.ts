import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCharacterSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.string().optional().nullable(),
  personality: z.string().min(1).optional(),
  speakStyle: z.string().min(1).optional(),
  motivations: z.string().optional().nullable(),
  restrictions: z.string().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; charId: string } }
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
    const parsed = updateCharacterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const character = await prisma.character.update({
      where: { id: params.charId },
      data: parsed.data,
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('PATCH /api/series/[id]/characters/[charId]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; charId: string } }
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

    await prisma.character.delete({ where: { id: params.charId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/series/[id]/characters/[charId]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
