import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { ModelWithGenerations, ModelResponse } from '@razbor/hooks'
import { bodyTypeLabels, type BodyType } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ brandSlug: string; modelSlug: string }>
}

function formatYears(yearStart: number, yearEnd: number | null): string {
  if (yearEnd) {
    return `${yearStart}-${yearEnd}`
  }
  return `${yearStart}-н.в.`
}

export default async function GenerationsPage({ params }: Props) {
  const { brandSlug, modelSlug } = await params
  const data = await fetchGraphQL<ModelResponse>(queries.model, {
    brandSlug,
    modelSlug,
  })

  if (!data.model) {
    notFound()
  }

  const { model } = data

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-4">
        <Link
          href={`/${brandSlug}`}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">{model.name}</h1>
      </header>

      <div className="px-4 pb-2">
        <p className="text-zinc-500 text-sm">Выберите поколение</p>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="space-y-2">
          {model.generations.map((gen) => (
            <Link
              key={gen.id}
              href={`/calculator/${gen.id}?brand=${brandSlug}&model=${modelSlug}`}
              className="w-full bg-zinc-900 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-zinc-800 transition-colors active:scale-[0.99]"
            >
              <div className="text-left">
                <span className="text-zinc-100 font-medium">
                  {gen.name}
                </span>
                <span className="text-zinc-500 ml-2">
                  • {bodyTypeLabels[gen.bodyType as BodyType] || gen.bodyType}
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
