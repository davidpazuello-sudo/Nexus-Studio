'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ChevronDown, ChevronRight, BookOpen, Film, CheckSquare, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

type Series = {
  id: string
  title: string
}

type SidebarProps = {
  series: Series[]
  loading?: boolean
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

function SeriesItem({ s }: { s: Series }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(
    pathname.startsWith(`/series/${s.id}`)
  )

  const isBibliaActive = pathname === `/series/${s.id}`
  const isEpisodesActive = pathname.startsWith(`/series/${s.id}/episodes`)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm',
          'text-slate-300 hover:bg-white/10 transition-colors',
          (isBibliaActive || isEpisodesActive) && 'text-white font-medium'
        )}
      >
        <span className="truncate">{s.title}</span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
          <Link
            href={`/series/${s.id}`}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
              isBibliaActive
                ? 'bg-[#D4EDE3] text-[#1A6B35] font-bold'
                : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
            )}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            Bíblia
          </Link>
          <Link
            href={`/series/${s.id}/episodes`}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
              isEpisodesActive
                ? 'bg-[#D4EDE3] text-[#1A6B35] font-bold'
                : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
            )}
          >
            <Film className="w-3.5 h-3.5 shrink-0" />
            Episódios
          </Link>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ series, loading, user }: SidebarProps) {
  const pathname = usePathname()
  const isChecklistActive = pathname === '/checklist'

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] flex flex-col bg-[#1E2A3A] z-40"
      aria-label="Navegação principal"
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <span className="text-xl">⛏</span>
        <span className="text-sm font-semibold text-[#7EDBA8]">Nexus Studio</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
        {/* Séries */}
        <p className="px-3 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Séries
        </p>

        {loading ? (
          <div className="flex flex-col gap-2 px-3">
            <Skeleton className="h-8 w-full bg-white/10" />
            <Skeleton className="h-8 w-full bg-white/10" />
          </div>
        ) : series.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-500">
            Nenhuma série ainda.
          </p>
        ) : (
          series.map((s) => <SeriesItem key={s.id} s={s} />)
        )}

        <Separator className="my-2 bg-white/10" />

        {/* Checklist */}
        <Link
          href="/checklist"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            isChecklistActive
              ? 'bg-[#D4EDE3] text-[#1A6B35] font-bold'
              : 'text-slate-300 hover:bg-white/10'
          )}
        >
          <CheckSquare className="w-4 h-4 shrink-0" />
          Checklist
        </Link>
      </nav>

      {/* Rodapé — usuário + logout */}
      <div className="border-t border-white/10 px-3 py-3 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-200 truncate">
            {user.name ?? user.email}
          </p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Sair"
          className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="sr-only">Sair</span>
        </button>
      </div>
    </aside>
  )
}
