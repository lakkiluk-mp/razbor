import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { ModelResponse } from '@razbor/hooks'
import { bodyTypeLabels, type BodyType } from '@/lib/types'

export function GenerationsPage() {
  const { brandSlug, modelSlug } = useParams<{ brandSlug: string; modelSlug: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['model', brandSlug, modelSlug],
    queryFn: () => fetchGraphQL<ModelResponse>(queries.model, { brandSlug, modelSlug }),
    enabled: !!brandSlug && !!modelSlug,
  })

  useEffect(() => {
    if (!isLoading && !data?.model) {
      navigate('/')
    }
  }, [isLoading, data, navigate])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.BackButton.show()
    const handleBack = () => navigate(-1)
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [navigate])

  if (isLoading) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Ошибка загрузки данных</p>
      </div>
    )
  }

  if (!data?.model) {
    return null
  }

  const { model } = data

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold mb-1">{model.name}</h1>
        <p className="text-zinc-500 text-sm">Выберите поколение</p>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="space-y-2">
          {model.generations.map((gen) => (
            <Link
              key={gen.id}
              to={`/${brandSlug}/${modelSlug}/${gen.slug}/config`}
              className="w-full bg-zinc-900 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-zinc-800 transition-colors active:scale-[0.99]"
            >
              <div className="text-left">
                <span className="text-zinc-100 font-medium">
                  {gen.name}
                </span>
                <span className="text-zinc-500 ml-2">
                  {bodyTypeLabels[gen.bodyType as BodyType] || gen.bodyType}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
