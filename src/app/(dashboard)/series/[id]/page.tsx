'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, Trash2, User, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type Series = {
  id: string
  title: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  premise: string | null
  tone: string | null
  ageTarget: string | null
  vocabulary: string | null
  visualStyle: string | null
  worldRules: string | null
  seasonArc: string | null
  _count: { episodes: number; characters: number }
}

type Character = {
  id: string
  name: string
  age: string | null
  personality: string
  speakStyle: string
  motivations: string | null
  restrictions: string | null
}

const statusLabel: Record<string, string> = {
  ACTIVE: 'Ativa', PAUSED: 'Pausada', COMPLETED: 'Concluída',
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-700',
}

const emptyChar = { name: '', age: '', personality: '', speakStyle: '', motivations: '', restrictions: '' }

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)
  const [bible, setBible] = useState({
    premise: '', tone: '', ageTarget: '', vocabulary: '', visualStyle: '', worldRules: '', seasonArc: '',
  })
  const [autoSaving, setAutoSaving] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [charCount, setCharCount] = useState(0)
  const [charSheet, setCharSheet] = useState<{ open: boolean; editing: Character | null }>({ open: false, editing: null })
  const [charForm, setCharForm] = useState(emptyChar)
  const [savingChar, setSavingChar] = useState(false)
  const [deleteCharId, setDeleteCharId] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const initializedRef = useRef(false)

  // Carregar série
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/series/${id}`)
        if (!res.ok) { router.push('/series'); return }
        const data: Series & { characters: Character[] } = await res.json()
        setSeries(data)
        setBible({
          premise: data.premise ?? '',
          tone: data.tone ?? '',
          ageTarget: data.ageTarget ?? '',
          vocabulary: data.vocabulary ?? '',
          visualStyle: data.visualStyle ?? '',
          worldRules: data.worldRules ?? '',
          seasonArc: data.seasonArc ?? '',
        })
        setCharacters(data.characters ?? [])
        setCharCount(data._count.characters)
      } catch {
        toast.error('Erro ao carregar série.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router])

  // Auto-save Bíblia com debounce de 2s
  useEffect(() => {
    if (!initializedRef.current) { initializedRef.current = true; return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setAutoSaving(true)
      try {
        await fetch(`/api/series/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bible),
        })
      } catch {
        toast.error('Erro ao salvar automaticamente.')
      } finally {
        setAutoSaving(false)
      }
    }, 2000)
    return () => clearTimeout(debounceRef.current)
  }, [bible, id])

  const loadCharacters = useCallback(async () => {
    try {
      const res = await fetch(`/api/series/${id}/characters`)
      if (res.ok) {
        const data = await res.json()
        setCharacters(data)
        setCharCount(data.length)
      }
    } catch {
      toast.error('Erro ao carregar personagens.')
    }
  }, [id])

  async function handleSaveChar() {
    if (!charForm.name.trim()) { toast.error('Nome é obrigatório.'); return }
    if (!charForm.personality.trim()) { toast.error('Personalidade é obrigatória.'); return }
    if (!charForm.speakStyle.trim()) { toast.error('Estilo de fala é obrigatório.'); return }
    setSavingChar(true)
    try {
      const isEdit = !!charSheet.editing
      const url = isEdit
        ? `/api/series/${id}/characters/${charSheet.editing!.id}`
        : `/api/series/${id}/characters`
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charForm),
      })
      if (!res.ok) throw new Error()
      toast.success(isEdit ? 'Personagem atualizado!' : 'Personagem criado!')
      setCharSheet({ open: false, editing: null })
      loadCharacters()
    } catch {
      toast.error('Erro ao salvar personagem.')
    } finally {
      setSavingChar(false)
    }
  }

  async function handleDeleteChar() {
    if (!deleteCharId) return
    try {
      const res = await fetch(`/api/series/${id}/characters/${deleteCharId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Personagem excluído.')
      setDeleteCharId(null)
      loadCharacters()
    } catch {
      toast.error('Erro ao excluir personagem.')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (!series) return null

  return (
    <div className="p-6 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Link href="/series"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate">{series.title}</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[series.status]}`}>
              {statusLabel[series.status]}
            </span>
            <span className="text-xs text-gray-400">{series._count.episodes} ep · {charCount} pers.</span>
            {autoSaving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="bible">
        <TabsList className="mb-6">
          <TabsTrigger value="bible">Bíblia da Série</TabsTrigger>
          <TabsTrigger value="characters">
            Personagens ({charCount})
          </TabsTrigger>
          <TabsTrigger value="episodes" disabled>Episódios</TabsTrigger>
        </TabsList>

        {/* ── BÍBLIA ── */}
        <TabsContent value="bible" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tone">Tom</Label>
              <Input
                id="tone"
                placeholder="Ex: aventura com humor leve"
                value={bible.tone}
                onChange={e => setBible(b => ({ ...b, tone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ageTarget">Público-alvo</Label>
              <Input
                id="ageTarget"
                placeholder="Ex: 6-10 anos"
                value={bible.ageTarget}
                onChange={e => setBible(b => ({ ...b, ageTarget: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="premise">Premissa</Label>
            <Textarea
              id="premise"
              placeholder="Escreva a premissa da série em 1 parágrafo..."
              value={bible.premise}
              onChange={e => setBible(b => ({ ...b, premise: e.target.value }))}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="seasonArc">Arco da Temporada</Label>
            <Textarea
              id="seasonArc"
              placeholder="Descreva o arco narrativo completo da temporada..."
              value={bible.seasonArc}
              onChange={e => setBible(b => ({ ...b, seasonArc: e.target.value }))}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="vocabulary">Regras de Vocabulário</Label>
            <Textarea
              id="vocabulary"
              placeholder="Ex: Nunca usar palavras difíceis. Usar diminutivos. Evitar violência..."
              value={bible.vocabulary}
              onChange={e => setBible(b => ({ ...b, vocabulary: e.target.value }))}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="visualStyle">Estilo Visual</Label>
            <Textarea
              id="visualStyle"
              placeholder="Paleta de cores, referências visuais, estética geral..."
              value={bible.visualStyle}
              onChange={e => setBible(b => ({ ...b, visualStyle: e.target.value }))}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="worldRules">Regras do Mundo</Label>
            <Textarea
              id="worldRules"
              placeholder="O que existe e não existe neste universo. Física, magia, limitações..."
              value={bible.worldRules}
              onChange={e => setBible(b => ({ ...b, worldRules: e.target.value }))}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <p className="text-xs text-gray-400 pt-1">
            {autoSaving ? 'Salvando automaticamente...' : 'Salvo automaticamente a cada 2 segundos.'}
          </p>
        </TabsContent>

        {/* ── PERSONAGENS ── */}
        <TabsContent value="characters">
          <div className="flex justify-end mb-4">
            <Button
              className="bg-[#1A6B35] hover:bg-[#155a2c] text-white"
              onClick={() => { setCharForm(emptyChar); setCharSheet({ open: true, editing: null }) }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Personagem
            </Button>
          </div>

          {characters.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-25" />
              <p className="font-medium text-gray-600">Nenhum personagem ainda.</p>
              <p className="text-sm mt-1">Adicione personagens para completar a Bíblia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {characters.map(c => (
                <div
                  key={c.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{c.name}</span>
                      {c.age && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{c.age}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.personality}</p>
                    <p className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">"{c.speakStyle}"</p>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setCharForm({
                          name: c.name,
                          age: c.age ?? '',
                          personality: c.personality,
                          speakStyle: c.speakStyle,
                          motivations: c.motivations ?? '',
                          restrictions: c.restrictions ?? '',
                        })
                        setCharSheet({ open: true, editing: c })
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteCharId(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sheet: Adicionar / Editar Personagem */}
      <Sheet open={charSheet.open} onOpenChange={v => { if (!v) setCharSheet({ open: false, editing: null }) }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{charSheet.editing ? 'Editar Personagem' : 'Novo Personagem'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="char-name">Nome *</Label>
                <Input
                  id="char-name"
                  placeholder="Nome do personagem"
                  value={charForm.name}
                  onChange={e => setCharForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="char-age">Idade</Label>
                <Input
                  id="char-age"
                  placeholder="Ex: 10 anos"
                  value={charForm.age ?? ''}
                  onChange={e => setCharForm(f => ({ ...f, age: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="char-personality">Personalidade *</Label>
              <Textarea
                id="char-personality"
                placeholder="Como é, como age, seus traços principais..."
                value={charForm.personality}
                onChange={e => setCharForm(f => ({ ...f, personality: e.target.value }))}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="char-speak">Estilo de Fala *</Label>
              <Textarea
                id="char-speak"
                placeholder="Como fala, tom, expressões características..."
                value={charForm.speakStyle}
                onChange={e => setCharForm(f => ({ ...f, speakStyle: e.target.value }))}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="char-motivations">Motivações</Label>
              <Textarea
                id="char-motivations"
                placeholder="O que move esse personagem, seus objetivos..."
                value={charForm.motivations ?? ''}
                onChange={e => setCharForm(f => ({ ...f, motivations: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div>
              <Label htmlFor="char-restrictions">Restrições</Label>
              <Textarea
                id="char-restrictions"
                placeholder="O que esse personagem NUNCA faz ou diz..."
                value={charForm.restrictions ?? ''}
                onChange={e => setCharForm(f => ({ ...f, restrictions: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setCharSheet({ open: false, editing: null })}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1A6B35] hover:bg-[#155a2c] text-white"
              onClick={handleSaveChar}
              disabled={savingChar}
            >
              {savingChar ? 'Salvando...' : charSheet.editing ? 'Salvar' : 'Criar Personagem'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* AlertDialog: Excluir personagem */}
      <AlertDialog open={!!deleteCharId} onOpenChange={v => { if (!v) setDeleteCharId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir personagem?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteChar}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
