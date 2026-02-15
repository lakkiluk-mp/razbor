import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { AdminStatsResponse } from '@/types/admin'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const { isLoading, isError } = useQuery({
    queryKey: ['adminCheck'],
    queryFn: () => fetchGraphQL<AdminStatsResponse>(queries.adminStats),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })

  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Проверка доступа...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldX className="w-16 h-16 text-red-500/60" />
          <h1 className="text-xl font-bold">Доступ запрещён</h1>
          <p className="text-zinc-400 text-sm">
            У вас нет прав для доступа к админ-панели
          </p>
          <button
            type="button"
            className="mt-2 bg-zinc-800 text-zinc-100 rounded-xl px-6 py-3 font-semibold text-sm active:scale-95 transition-transform"
            onClick={() => navigate('/')}
          >
            Назад к приложению
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
