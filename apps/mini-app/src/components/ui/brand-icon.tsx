import { getBrandIcon } from '@/lib/brand-icons'

interface BrandIconProps {
  slug: string
  name: string
  size?: number
}

export function BrandIcon({ slug, name, size = 28 }: BrandIconProps) {
  const icon = getBrandIcon(slug)

  return (
    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300">
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          width={size}
          height={size}
          aria-hidden="true"
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <span className="text-lg font-bold">{name.charAt(0)}</span>
      )}
    </div>
  )
}
