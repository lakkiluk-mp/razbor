import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { BrandsResponse } from '@razbor/hooks'
import { BrandIcon } from '@/components/ui/brand-icon'

function getBrandNameClass(name: string) {
  if (name.length > 10) return 'text-[10px]'
  if (name.length > 6) return 'text-xs'
  return 'text-sm'
}

export function BrandsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetchGraphQL<BrandsResponse>(queries.brands),
  })

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

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Калькулятор запчастей</h1>
        <p className="text-zinc-500 text-sm mt-1">Выберите марку автомобиля</p>
      </header>

      <div className="flex-1 px-4 pb-4 overflow-auto">
        <div className="grid grid-cols-3 gap-3">
          {data?.brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/${brand.slug}`}
              className="aspect-square bg-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-colors active:scale-95"
            >
              <BrandIcon logo={brand.logo} name={brand.name} />
              <span className={`${getBrandNameClass(brand.name)} text-zinc-300 text-center leading-tight px-1`}>{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
