import Link from 'next/link'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { Brand, BrandsResponse } from '@razbor/hooks'
import { UsageCounter } from '@/components/features/usage-counter'
import { BrandIcon } from '@/components/ui/brand-icon'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await fetchGraphQL<BrandsResponse>(queries.brands)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Калькулятор запчастей</h1>
        <p className="text-zinc-500 text-sm mt-1">Выберите марку автомобиля</p>
      </header>

      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {data.brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/${brand.slug}`}
              className="aspect-square bg-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-colors active:scale-95"
            >
              <BrandIcon slug={brand.slug} name={brand.name} />
              <span className="text-sm text-zinc-300">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <UsageCounter />
    </div>
  )
}
