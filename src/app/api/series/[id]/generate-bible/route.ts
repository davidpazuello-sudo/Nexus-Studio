import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const series = await prisma.series.findUnique({
    where: { id: params.id },
    select: { tone: true, ageTarget: true, premise: true, createdById: true },
  })

  if (!series) return NextResponse.json({ error: 'Série não encontrada' }, { status: 404 })
  if (series.createdById !== session.user.id) return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  if (!series.tone || !series.ageTarget || !series.premise) {
    return NextResponse.json(
      { error: 'Preencha tom, faixa etária e premissa antes de usar a IA.' },
      { status: 400 }
    )
  }

  const prompt = `Você é um roteirista experiente. Gere os seguintes campos de bíblia para uma série de TV com base nas informações abaixo.

Tom: ${series.tone}
Faixa etária: ${series.ageTarget}
Premissa: ${series.premise}

Retorne APENAS um JSON válido com exatamente estas chaves:
{
  "seasonArc": "arco dramático da temporada em 2-3 parágrafos",
  "vocabulary": "vocabulário e linguagem característicos da série",
  "visualStyle": "estilo visual e diretrizes de produção",
  "worldRules": "regras do universo da série"
}`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'IA retornou formato inválido.' }, { status: 500 })

  const fields = JSON.parse(jsonMatch[0])

  const updated = await prisma.series.update({
    where: { id: params.id },
    data: {
      seasonArc: fields.seasonArc || '',
      vocabulary: fields.vocabulary || '',
      visualStyle: fields.visualStyle || '',
      worldRules: fields.worldRules || '',
    },
  })

  return NextResponse.json(updated)
}