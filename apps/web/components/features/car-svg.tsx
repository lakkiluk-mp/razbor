'use client'

interface CarSvgProps {
  className?: string
}

export function CarFrontSvg({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M40 110 L40 70 Q40 50 60 45 L70 30 Q100 20 130 30 L140 45 Q160 50 160 70 L160 110" />
      <path d="M70 30 L70 50 L130 50 L130 30" />
      <path d="M72 32 L72 48 L128 48 L128 32 Q100 25 72 32" fill="none" />
      <path d="M60 50 L140 50 L145 70 L55 70 Z" />
      <rect x="75" y="72" width="50" height="15" rx="2" />
      <ellipse cx="55" cy="75" rx="12" ry="8" />
      <ellipse cx="145" cy="75" rx="12" ry="8" />
      <path d="M35 90 L165 90 L160 110 L40 110 Z" />
      <ellipse cx="50" cy="120" rx="15" ry="8" />
      <ellipse cx="150" cy="120" rx="15" ry="8" />
      <rect x="85" y="95" width="30" height="10" rx="1" />
    </svg>
  )
}

export function CarBackSvg({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M40 110 L40 70 Q40 50 60 45 L70 30 Q100 20 130 30 L140 45 Q160 50 160 70 L160 110" />
      <path d="M70 30 L70 50 L130 50 L130 30" />
      <path d="M72 32 L72 48 L128 48 L128 32 Q100 25 72 32" fill="none" />
      <path d="M60 50 L140 50 L145 70 L55 70 Z" />
      <rect x="42" y="72" width="20" height="12" rx="2" />
      <rect x="138" y="72" width="20" height="12" rx="2" />
      <line x1="90" y1="60" x2="110" y2="60" />
      <path d="M35 90 L165 90 L160 110 L40 110 Z" />
      <rect x="80" y="93" width="40" height="12" rx="1" />
      <ellipse cx="50" cy="120" rx="15" ry="8" />
      <ellipse cx="150" cy="120" rx="15" ry="8" />
      <ellipse cx="70" cy="108" rx="6" ry="3" />
      <ellipse cx="130" cy="108" rx="6" ry="3" />
    </svg>
  )
}

export function CarLeftSvg({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M30 85 L30 60 L50 60 L70 35 L130 25 L180 25 L200 35 L220 35 L240 50 L270 55 L270 85" />
      <path d="M70 35 L70 55 L200 55 L200 35" />
      <path d="M72 37 L72 53 L130 53 L130 27" />
      <path d="M132 27 L132 53 L198 53 L198 37" />
      <line x1="130" y1="27" x2="130" y2="53" />
      <line x1="100" y1="55" x2="100" y2="85" />
      <line x1="165" y1="55" x2="165" y2="85" />
      <rect x="85" y="62" width="10" height="3" rx="1" />
      <rect x="145" y="62" width="10" height="3" rx="1" />
      <path d="M50 85 Q50 65 70 65 Q90 65 90 85" />
      <path d="M200 85 Q200 65 220 65 Q240 65 240 85" />
      <circle cx="70" cy="90" r="18" />
      <circle cx="70" cy="90" r="10" />
      <circle cx="220" cy="90" r="18" />
      <circle cx="220" cy="90" r="10" />
      <path d="M30 60 L30 75 L45 70 L45 55 Z" />
      <path d="M265 58 L270 58 L270 75 L260 75 Z" />
      <path d="M25 75 L25 90 L50 90 L50 80 L30 80 Z" />
      <path d="M270 75 L275 75 L275 90 L240 90 L240 85 L270 85 Z" />
      <ellipse cx="62" cy="45" rx="5" ry="8" />
    </svg>
  )
}

export function CarRightSvg({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M270 85 L270 60 L250 60 L230 35 L170 25 L120 25 L100 35 L80 35 L60 50 L30 55 L30 85" />
      <path d="M230 35 L230 55 L100 55 L100 35" />
      <path d="M228 37 L228 53 L170 53 L170 27" />
      <path d="M168 27 L168 53 L102 53 L102 37" />
      <line x1="170" y1="27" x2="170" y2="53" />
      <line x1="200" y1="55" x2="200" y2="85" />
      <line x1="135" y1="55" x2="135" y2="85" />
      <rect x="205" y="62" width="10" height="3" rx="1" />
      <rect x="145" y="62" width="10" height="3" rx="1" />
      <path d="M250 85 Q250 65 230 65 Q210 65 210 85" />
      <path d="M100 85 Q100 65 80 65 Q60 65 60 85" />
      <circle cx="230" cy="90" r="18" />
      <circle cx="230" cy="90" r="10" />
      <circle cx="80" cy="90" r="18" />
      <circle cx="80" cy="90" r="10" />
      <path d="M270 60 L270 75 L255 70 L255 55 Z" />
      <path d="M35 58 L30 58 L30 75 L40 75 Z" />
      <path d="M275 75 L275 90 L250 90 L250 80 L270 80 Z" />
      <path d="M30 75 L25 75 L25 90 L60 90 L60 85 L30 85 Z" />
      <ellipse cx="238" cy="45" rx="5" ry="8" />
    </svg>
  )
}

export function CarFrontThumb({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M15 32 L15 18 Q15 12 22 10 L25 5 Q30 3 35 5 L38 10 Q45 12 45 18 L45 32" />
      <ellipse cx="18" cy="36" rx="5" ry="2" />
      <ellipse cx="42" cy="36" rx="5" ry="2" />
    </svg>
  )
}

export function CarLeftThumb({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M5 28 L5 20 L12 12 L35 8 L45 12 L52 18 L55 28" />
      <circle cx="15" cy="30" r="5" />
      <circle cx="45" cy="30" r="5" />
    </svg>
  )
}

export function CarBackThumb({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M15 32 L15 18 Q15 12 22 10 L25 5 Q30 3 35 5 L38 10 Q45 12 45 18 L45 32" />
      <rect x="17" y="20" width="6" height="4" rx="1" />
      <rect x="37" y="20" width="6" height="4" rx="1" />
      <ellipse cx="18" cy="36" rx="5" ry="2" />
      <ellipse cx="42" cy="36" rx="5" ry="2" />
    </svg>
  )
}

export function CarRightThumb({ className }: CarSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M55 28 L55 20 L48 12 L25 8 L15 12 L8 18 L5 28" />
      <circle cx="45" cy="30" r="5" />
      <circle cx="15" cy="30" r="5" />
    </svg>
  )
}
