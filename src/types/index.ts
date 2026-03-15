// Re-exports do Prisma — use estes tipos em todo o projeto
export type {
  User,
  Series,
  Character,
  Episode,
  Scene,
  Role,
  SeriesStatus,
  EpisodeStatus,
  SceneStatus,
  Pipeline,
} from '@prisma/client'

// ── Tipos compostos ──────────────────────────────────────

import type { Series, Character, Episode, Scene, User } from '@prisma/client'

export type SeriesWithRelations = Series & {
  characters: Character[]
  episodes: Episode[]
  createdBy: User
}

export type SeriesWithCounts = Series & {
  _count: {
    episodes: number
    characters: number
  }
}

export type EpisodeWithScenes = Episode & {
  scenes: Scene[]
  series: Pick<Series, 'id' | 'title'>
}

export type EpisodeWithSeries = Episode & {
  series: SeriesWithRelations
}

export type SceneWithEpisode = Scene & {
  episode: Episode & {
    series: Pick<Series, 'id' | 'title'>
  }
}

// ── Tipos de API ─────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
}
