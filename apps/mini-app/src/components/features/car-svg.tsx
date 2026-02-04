interface CarSvgProps {
  className?: string
}

const whiteFilter = { filter: 'brightness(0) invert(1)' }

export function CarFrontSvg({ className }: CarSvgProps) {
  return <img src="/car-left.svg" alt="Вид спереди" className={className} style={whiteFilter} />
}

export function CarBackSvg({ className }: CarSvgProps) {
  return <img src="/car-back.svg" alt="Вид сзади" className={className} style={whiteFilter} />
}

export function CarLeftSvg({ className }: CarSvgProps) {
  return <img src="/car-right.svg" alt="Вид слева" className={className} style={whiteFilter} />
}

export function CarRightSvg({ className }: CarSvgProps) {
  return <img src="/car-right.svg" alt="Вид справа" className={className} style={{ transform: 'scaleX(-1)', ...whiteFilter }} />
}

export function CarFrontThumb({ className }: CarSvgProps) {
  return <img src="/car-left.svg" alt="Спереди" className={className} style={whiteFilter} />
}

export function CarLeftThumb({ className }: CarSvgProps) {
  return <img src="/car-right.svg" alt="Слева" className={className} style={whiteFilter} />
}

export function CarBackThumb({ className }: CarSvgProps) {
  return <img src="/car-back.svg" alt="Сзади" className={className} style={whiteFilter} />
}

export function CarRightThumb({ className }: CarSvgProps) {
  return <img src="/car-right.svg" alt="Справа" className={className} style={{ transform: 'scaleX(-1)', ...whiteFilter }} />
}
