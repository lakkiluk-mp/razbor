'use client'

import Image from 'next/image'

interface CarSvgProps {
  className?: string
}

const whiteFilter = { filter: 'brightness(0) invert(1)' }

export function CarFrontSvg({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-left.svg"
      alt="Вид спереди"
      width={600}
      height={240}
      className={className}
      style={whiteFilter}
      priority
    />
  )
}

export function CarBackSvg({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-back.svg"
      alt="Вид сзади"
      width={400}
      height={300}
      className={className}
      style={whiteFilter}
      priority
    />
  )
}

export function CarLeftSvg({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-right.svg"
      alt="Вид слева"
      width={600}
      height={240}
      className={className}
      style={whiteFilter}
      priority
    />
  )
}

export function CarRightSvg({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-right.svg"
      alt="Вид справа"
      width={600}
      height={240}
      className={className}
      style={{ transform: 'scaleX(-1)', ...whiteFilter }}
      priority
    />
  )
}

export function CarFrontThumb({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-left.svg"
      alt="Спереди"
      width={60}
      height={24}
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarLeftThumb({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-right.svg"
      alt="Слева"
      width={60}
      height={24}
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarBackThumb({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-back.svg"
      alt="Сзади"
      width={60}
      height={45}
      className={className}
      style={whiteFilter}
    />
  )
}

export function CarRightThumb({ className }: CarSvgProps) {
  return (
    <Image
      src="/car-right.svg"
      alt="Справа"
      width={60}
      height={24}
      className={className}
      style={{ transform: 'scaleX(-1)', ...whiteFilter }}
    />
  )
}
