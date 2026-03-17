'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, MoreVertical, Pencil, Trash2, Tv } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type Series = {
  id: string
  title: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  createdAt: string
  _count: { episodes: number; characters: number }
}

const statusLabel: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  COMPLETED: 'Concluída',
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-700',
}

const emptyForm = { title: '', status: 'ACTIVE' as Series['status'] }

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<Series | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadSeries = useCallback(async () => {
    try {
      const res = await fetch('/api/series')
      if (!res.ok) throw new Error()
      setSeries(await res.json())
    } catch {
      toast.error('Erro ao carregar séries.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSeries() }, [loadSeries])

  async function handleCreate() {
    if (!form.title.trim()) { toast.error('Título é obrigatório.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Série criada!')
      setOpenCreate(false)
      setForm(emptyForm)
      loadSeries()
    } catch {
      toast.error('Erro ao criar série.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!openEdit || !form.title.trim()) { toast.error('Título é obrigatório.'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/series/${openEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Série atualizada!')
      setOpenEdit(null)
      loadSeries()
    } catch {
      toast.error('Erro ao atualizar série.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/series/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Série excluída.')
      setDeleteId(null)
      loadSeries()
    } catch {
      toast.error('Erro ao excluir série.')
    }
  }

  const handleNovaTemporada = async (seriesId: string) => {
    try {
      const res = await fetch(`/api/series/${seriesId}/nova-temporada`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar nova temporada.')
      toast.success(`"${data.title}" criada com sucesso!`)
      loadSeries()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar nova temporada.')
    }
  }
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Séries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {series.length} série{series.length !== 1 ? 's' : ''} cadastrada{series.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          className="bg-[#1A6B35] hover:bg-[#155a2c] text-white"
          onClick={() => { setForm(emptyForm); setOpenCreate(true) }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Série
        </Button>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && series.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Tv className="w-14 h-14 mx-auto mb-3 opacity-25" />
          <p className="font-medium text-gray-600">Nenhuma série ainda.</p>
          <p className="text-sm mt-1">Crie sua primeira série para começar.</p>
        </div>
      )}

      {/* Cards grid */}
      {!loading && series.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map(s => (
            <Card key={s.id} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight line-clamp-2 flex-1">
                    {s.title}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-0.5 -mr-1">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => { setForm({ title: s.title, status: s.status }); setOpenEdit(s) }}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleNovaTemporada(s.id)}>
                <Plus className="w-4 h-4 mr-2" /> Nova Temporada
              </DropdownMenuItem>
<DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteId(s.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${statusColor[s.status]}`}>
                  {statusLabel[s.status]}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                  <span>{s._count.episodes} episódio{s._count.episodes !== 1 ? 's' : ''}</span>
                  <span>{s._count.characters} personagem{s._count.characters !== 1 ? 'ns' : ''}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full text-[#1A6B35] border-[#1A6B35] hover:bg-green-50">
                  <Link href={`/series/${s.id}`}>Ver Bíblia</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Nova Série */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Série</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="new-title">Título *</Label>
              <Input
                id="new-title"
                placeholder="Ex: Minecraft Kids — Temporada 1"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={v => setForm(f => ({ ...f, status: v as Series['status'] }))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativa</SelectItem>
                  <SelectItem value="PAUSED">Pausada</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
            <Button
              className="bg-[#1A6B35] hover:bg-[#155a2c] text-white"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? 'Criando...' : 'Criar Série'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Série */}
      <Dialog open={!!openEdit} onOpenChange={v => { if (!v) setOpenEdit(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Série</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleEdit()}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={v => setForm(f => ({ ...f, status: v as Series['status'] }))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativa</SelectItem>
                  <SelectItem value="PAUSED">Pausada</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(null)}>Cancelar</Button>
            <Button
              className="bg-[#1A6B35] hover:bg-[#155a2c] text-white"
              onClick={handleEdit}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta série?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os episódios e personagens serão excluídos permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
