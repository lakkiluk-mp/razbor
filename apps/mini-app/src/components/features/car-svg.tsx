import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CarSvgProps {
  className?: string
}

interface CarSvgImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

const whiteFilter = { filter: 'brightness(0) invert(1)' }

function CarSvgImage({ src, alt, className, style }: CarSvgImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn('relative', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-800/50 rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={style}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}

export function CarFrontSvg({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-left.svg"
      alt="Вид спереди"
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarBackSvg({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-back.svg"
      alt="Вид сзади"
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarLeftSvg({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-right.svg"
      alt="Вид слева"
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarRightSvg({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-right.svg"
      alt="Вид справа"
      className={className}
      style={{ transform: 'scaleX(-1)', ...whiteFilter }}
    />
  )
}

export function CarFrontThumb({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-left.svg"
      alt="Спереди"
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarLeftThumb({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-right.svg"
      alt="Слева"
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarBackThumb({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-back.svg"
      alt="Сзади"
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarRightThumb({ className }: CarSvgProps) {
  return (
    <CarSvgImage
      src="/car-right.svg"
      alt="Справа"
      className={className}
      style={{ transform: 'scaleX(-1)', ...whiteFilter }}
    />
  )
}
