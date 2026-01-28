import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql'
import type { Brand, Model } from '@/lib/types'

interface BrandResponse {
  brand: (Brand & { models: Model[] }) | null
}

interface Props {
  params: Promise<{ brandSlug: string }>
}

export default async function ModelsPage({ params }: Props) {
  const { brandSlug } = await params
  const data = await fetchGraphQL<BrandResponse>(queries.brand, { slug: brandSlug })

  if (!data.brand) {
    notFound()
  }

  const { brand } = data

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-4">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">{brand.name}</h1>
      </header>

      <div className="px-4 pb-2">
        <p className="text-zinc-500 text-sm">Выберите модель</p>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="space-y-2">
          {brand.models.map((model) => (
            <Link
              key={model.id}
              href={`/${brandSlug}/${model.slug}`}
              className="w-full bg-zinc-900 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-zinc-800 transition-colors active:scale-[0.99]"
            >
              <span className="text-zinc-100 font-medium">{model.name}</span>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
