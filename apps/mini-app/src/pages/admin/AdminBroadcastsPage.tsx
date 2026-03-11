import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Square, Plus, Upload, X, Loader2, Pin } from 'lucide-react'
import { fetchGraphQL, queries, mutations } from '@/lib/graphql-client'
import type {
  AdminBroadcastsResponse,
  CreateBroadcastResponse,
  SendBroadcastResponse,
  CancelBroadcastResponse,
  BroadcastStatus,
} from '@/types/broadcast'

const STATUS_LABELS: Record<BroadcastStatus, string> = {
  draft: 'Черновик',
  sending: 'Отправка...',
  completed: 'Отправлено',
  failed: 'Ошибка',
  cancelled: 'Отменено',
}

const STATUS_COLORS: Record<BroadcastStatus, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  sending: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-zinc-600/30 text-zinc-400',
}

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

export function AdminBroadcastsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [pinMessage, setPinMessage] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const savingRef = useRef(false)

  const { data, isLoading } = useQuery({
    queryKey: ['adminBroadcasts'],
    queryFn: () => fetchGraphQL<AdminBroadcastsResponse>(queries.adminBroadcasts, { limit: 50 }),
    refetchInterval: (query) => {
      const items = query.state.data?.adminBroadcasts?.items
      return items?.some((b) => b.status === 'sending') ? 3000 : false
    },
  })

  const createMutation = useMutation({
    mutationFn: (vars: { message?: string; imageUrls?: string[]; pinMessage?: boolean }) =>
      fetchGraphQL<CreateBroadcastResponse>(mutations.createBroadcast, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] })
      resetForm()
    },
    onSettled: () => { savingRef.current = false },
  })

  const sendMutation = useMutation({
    mutationFn: (id: string) => {
      setPendingActionId(id)
      return fetchGraphQL<SendBroadcastResponse>(mutations.sendBroadcast, { id })
    },
    onSettled: () => setPendingActionId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => {
      setPendingActionId(id)
      return fetchGraphQL<CancelBroadcastResponse>(mutations.cancelBroadcast, { id })
    },
    onSettled: () => setPendingActionId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] }),
  })

  const resetForm = useCallback(() => {
    setShowForm(false)
    setMessage('')
    setImageUrls([])
    setPinMessage(false)
  }, [])

  const MAX_PHOTOS = 10

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const available = MAX_PHOTOS - imageUrls.length
    if (available <= 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files).slice(0, available)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'x-telegram-init-data': getInitData() },
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const { url } = await res.json()
        setImageUrls((prev) => [...prev, url])
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (savingRef.current) return
    if (!message.trim() && imageUrls.length === 0) return
    savingRef.current = true
    createMutation.mutate({
      message: message.trim() || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      pinMessage: pinMessage || undefined,
    })
  }

  const handleSend = (id: string) => {
    if (sendMutation.isPending) return
    if (!confirm('Отправить рассылку всем пользователям?')) return
    sendMutation.mutate(id)
  }

  const handleCancel = (id: string) => {
    if (!confirm('Остановить рассылку?')) return
    cancelMutation.mutate(id)
  }

  const broadcasts = data?.adminBroadcasts?.items ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Рассылки</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-zinc-950 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Создать
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-zinc-900 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Новая рассылка</span>
            <button type="button" onClick={resetForm} className="text-zinc-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Текст рассылки (переносы строк сохраняются)"
            maxLength={imageUrls.length > 0 ? 1024 : 4096}
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
          />
          {message.length > 0 && (
            <div className="text-xs text-zinc-600 text-right">
              {message.length}/{imageUrls.length > 0 ? 1024 : 4096}
            </div>
          )}

          <div>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {imageUrls.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative inline-block">
                    <img src={url} alt={`Photo ${i + 1}`} className="h-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-zinc-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imageUrls.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 rounded-lg text-sm text-zinc-400 active:bg-zinc-700 transition-colors ${uploading ? 'opacity-50' : ''}`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Загрузка...' : `Добавить фото (${imageUrls.length}/${MAX_PHOTOS})`}
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinMessage}
              onChange={(e) => setPinMessage(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
            />
            <Pin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-sm text-zinc-300">Закрепить в чате</span>
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={(!message.trim() && imageUrls.length === 0) || createMutation.isPending}
            className="w-full py-2 bg-amber-500 text-zinc-950 rounded-lg text-sm font-medium disabled:opacity-40"
          >
            {createMutation.isPending ? 'Сохранение...' : 'Сохранить черновик'}
          </button>
        </div>
      )}

      {broadcasts.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-8">Нет рассылок</p>
      ) : (
        <div className="space-y-2">
          {broadcasts.map((b) => (
            <div key={b.id} className="bg-zinc-900 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                    {STATUS_LABELS[b.status]}
                  </span>
                  {b.pinMessage && <Pin className="inline w-3 h-3 text-amber-400 ml-1.5" />}
                  <span className="text-xs text-zinc-600 ml-2">
                    {new Date(b.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {b.status === 'draft' && (
                  <button
                    type="button"
                    onClick={() => handleSend(b.id)}
                    disabled={pendingActionId === b.id}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    Отправить
                  </button>
                )}
                {b.status === 'sending' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    disabled={pendingActionId === b.id}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium shrink-0"
                  >
                    <Square className="w-3 h-3" />
                    Стоп
                  </button>
                )}
              </div>

              {b.imageUrls.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {b.imageUrls.map((url, i) => (
                    <img key={`${url}-${i}`} src={url} alt={`${i + 1}`} className="h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}

              {b.message && (
                <p className="text-sm text-zinc-400 line-clamp-3 whitespace-pre-line">{b.message}</p>
              )}

              {b.status !== 'draft' && (
                <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                  <span>Всего: {b.totalUsers}</span>
                  <span>Доставлено: {b.sentCount}</span>
                  {b.failedCount > 0 && <span className="text-red-400">Ошибок: {b.failedCount}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
