import { PrismaClient, Role, SeriesStatus, EpisodeStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpar dados na ordem correta (respeitar foreign keys)
  await prisma.scene.deleteMany()
  await prisma.episode.deleteMany()
  await prisma.character.deleteMany()
  await prisma.series.deleteMany()
  await prisma.user.deleteMany()

  // ── USUÁRIO DIRECTOR ────────────────────────────────
  const director = await prisma.user.create({
    data: {
      email: 'diretor@nexusstudio.com',
      name: 'Diretor Nexus',
      role: Role.DIRECTOR,
    },
  })

  // ── SÉRIE DE EXEMPLO ────────────────────────────────
  const series = await prisma.series.create({
    data: {
      title: 'Aventuras no Minecraft',
      status: SeriesStatus.ACTIVE,
      createdById: director.id,
      premise:
        'Um grupo de amigos explora um mundo de Minecraft infinito, ' +
        'enfrentando desafios e aprendendo valores como amizade, ' +
        'coragem e criatividade.',
      tone: 'Aventura com humor leve e momentos educativos',
      ageTarget: '6-10 anos',
      vocabulary:
        'Linguagem simples e direta. Sem palavrões ou expressões negativas. ' +
        'Evitar palavras com mais de 3 sílabas sem necessidade. ' +
        'Expressões positivas e encorajadoras.',
      visualStyle:
        'Estética de blocos coloridos do Minecraft. Paleta vibrante com verdes, ' +
        'azuis e amarelos. Cenas diurnas predominantes. ' +
        'Iluminação clara e acolhedora.',
      worldRules:
        'Mundo de Minecraft padrão — sem mods ou mecânicas externas. ' +
        'Crianças são as protagonistas e resolvem os problemas sozinhas. ' +
        'Adultos existem no mundo mas nunca entregam soluções prontas. ' +
        'Sem mortes ou violência — personagens "ficam desanimados" em vez de morrer.',
      seasonArc:
        'Temporada 1 — Os Construtores do Amanhã: ' +
        'Pedro e Luna encontram um mapa misterioso no primeiro episódio. ' +
        'Ao longo de 10 episódios, cada peça do mapa revela um novo bioma ' +
        'e um novo desafio, culminando na descoberta de uma cidade perdida ' +
        'construída por crianças há séculos.',
    },
  })

  // ── PERSONAGENS ─────────────────────────────────────
  await prisma.character.createMany({
    data: [
      {
        seriesId: series.id,
        name: 'Pedro',
        age: '10 anos',
        personality:
          'Curioso, corajoso e às vezes impulsivo. ' +
          'Líder natural do grupo que ainda está aprendendo a ouvir os outros. ' +
          'Fica animado com qualquer coisa nova e desconhecida.',
        speakStyle:
          'Fala rápido quando está animado, às vezes atropela as palavras. ' +
          'Usa "caramba!" como interjeição favorita. ' +
          'Sempre tem uma ideia nova — nem sempre são boas ideias.',
        motivations:
          'Quer explorar cada canto do mundo e ser lembrado como o maior ' +
          'aventureiro que já existiu no Minecraft.',
        restrictions:
          'Nunca desiste de um amigo em apuros. ' +
          'Nunca age de má-fé — quando erra, erra por impulso, nunca por maldade.',
      },
      {
        seriesId: series.id,
        name: 'Luna',
        age: '9 anos',
        personality:
          'Inteligente, organizada e protetora. ' +
          'Contrapeso lógico ao Pedro impulsivo — ela planeja antes de agir. ' +
          'Se preocupa com o bem-estar de todos do grupo.',
        speakStyle:
          'Fala com calma e clareza. ' +
          'Usa "na verdade..." quando vai corrigir alguém, mas sem arrogância. ' +
          'Gosta de explicar como as coisas funcionam passo a passo.',
        motivations:
          'Quer entender as regras do mundo do Minecraft e registrar tudo ' +
          'em seu diário digital. Sonha em publicar um guia completo um dia.',
        restrictions:
          'Nunca humilha os amigos quando eles erram. ' +
          'Nunca abandona o grupo mesmo quando discorda da decisão.',
      },
    ],
  })

  // ── EPISÓDIO PILOTO ─────────────────────────────────
  await prisma.episode.create({
    data: {
      seriesId: series.id,
      order: 1,
      title: 'O Começo de Tudo',
      premise:
        'Pedro e Luna acordam juntos em um mundo de Minecraft completamente ' +
        'desconhecido — sem inventário, sem base, sem mapa. ' +
        'Precisam construir um abrigo antes do anoitecer (8 minutos de gameplay). ' +
        'No momento em que terminam, encontram um baú misterioso com o primeiro ' +
        'fragmento do mapa da temporada e a mensagem: "Bem-vindos, Construtores."',
      status: EpisodeStatus.DRAFT,
      durationMin: 8,
    },
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log(`   👤 Usuário: ${director.name} (${director.email}) — ${director.role}`)
  console.log(`   📺 Série: ${series.title}`)
  console.log(`   👥 Personagens: Pedro e Luna`)
  console.log(`   🎬 Episódio 1: "O Começo de Tudo" — ${EpisodeStatus.DRAFT}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
