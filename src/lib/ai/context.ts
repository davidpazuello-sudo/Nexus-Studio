// buildContext(episodeId) — OBRIGATÓRIO antes de qualquer chamada de IA
// Monta o payload completo com a Bíblia da Série + episódio atual

import { prisma } from '@/lib/prisma'

export type AIContext = {
  series: {
    title: string
    premise: string
    tone: string
    ageTarget: string
    vocabulary: string
    visualStyle: string
    worldRules: string
    seasonArc: string
  }
  characters: Array<{
    name: string
    age: string | null
    personality: string
    speakStyle: string
    motivations: string | null
    restrictions: string | null
  }>
  episode: {
    order: number
    title: string
    premise: string
    durationMin: number | null
  }
}

export async function buildContext(episodeId: string): Promise<AIContext> {
  const episode = await prisma.episode.findUniqueOrThrow({
    where: { id: episodeId },
    include: {
      series: {
        include: {
          characters: true,
        },
      },
    },
  })

  const { series } = episode

  return {
    series: {
      title: series.title,
      premise: series.premise ?? '',
      tone: series.tone ?? '',
      ageTarget: series.ageTarget ?? '',
      vocabulary: series.vocabulary ?? '',
      visualStyle: series.visualStyle ?? '',
      worldRules: series.worldRules ?? '',
      seasonArc: series.seasonArc ?? '',
    },
    characters: series.characters.map((c) => ({
      name: c.name,
      age: c.age,
      personality: c.personality,
      speakStyle: c.speakStyle,
      motivations: c.motivations,
      restrictions: c.restrictions,
    })),
    episode: {
      order: episode.order,
      title: episode.title,
      premise: episode.premise,
      durationMin: episode.durationMin,
    },
  }
}

export function formatContextForPrompt(context: AIContext): string {
  const { series, characters, episode } = context

  const characterList = characters
    .map(
      (c) =>
        `- ${c.name}${c.age ? ` (${c.age})` : ''}: ${c.personality}. ` +
        `Fala: ${c.speakStyle}.` +
        (c.restrictions ? ` Nunca: ${c.restrictions}.` : '')
    )
    .join('\n')

  return `
## BÍBLIA DA SÉRIE: ${series.title}

**Premissa:** ${series.premise}
**Tom:** ${series.tone}
**Público-alvo:** ${series.ageTarget}
**Vocabulário:** ${series.vocabulary}
**Estilo visual:** ${series.visualStyle}
**Regras do mundo:** ${series.worldRules}
**Arco da temporada:** ${series.seasonArc}

## PERSONAGENS
${characterList}

## EPISÓDIO ${episode.order}: ${episode.title}
**Briefing:** ${episode.premise}
${episode.durationMin ? `**Duração estimada:** ${episode.durationMin} minutos` : ''}
`.trim()
}
