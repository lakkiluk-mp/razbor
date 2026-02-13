interface CarSvgProps {
  className?: string
}

const svgDefaults = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  preserveAspectRatio: 'none' as const,
  'aria-hidden': true as const,
}

function SideViewContent() {
  return (
    <>
      <path d="M40,150 V108 L60,96 L95,86 L140,78 L166,42 C172,30 180,24 195,22 L300,20 C315,20 325,24 335,32 L358,55 L380,72 L410,78 L435,82 L450,92 L462,108 V150" />
      <path d="M40,150 H68 Q115,98 162,150 H300 Q347,98 394,150 H462" />
      <path d="M145,76 L170,40 C175,30 182,24 195,22 L300,20 C312,20 322,24 330,30 L358,55 L378,74 Z" />
      <line x1="250" y1="21" x2="250" y2="74" />
      <line x1="60" y1="96" x2="450" y2="92" />
      <line x1="250" y1="74" x2="250" y2="140" />
      <circle cx="115" cy="152" r="22" strokeWidth={4} />
      <circle cx="115" cy="152" r="4" fill="currentColor" stroke="none" />
      <circle cx="350" cy="152" r="22" strokeWidth={4} />
      <circle cx="350" cy="152" r="4" fill="currentColor" stroke="none" />
      <line x1="42" y1="108" x2="42" y2="122" strokeWidth={3} />
      <line x1="460" y1="102" x2="460" y2="120" strokeWidth={3} />
      <line x1="200" y1="92" x2="215" y2="92" strokeWidth={1.8} />
      <line x1="265" y1="92" x2="280" y2="92" strokeWidth={1.8} />
    </>
  )
}

function BackViewContent() {
  return (
    <>
      <path d="M55,225 V155 L62,105 Q72,62 92,48 L112,38 Q135,28 170,26 Q205,28 228,38 L248,48 Q268,62 278,105 L285,155 V225 H262 Q235,192 208,225 H132 Q105,192 78,225 Z" />
      <path d="M105,95 Q115,55 135,42 L165,34 Q170,32 175,34 L205,42 Q225,55 235,95 Z" />
      <rect x="64" y="120" width="12" height="34" rx="3" fill="currentColor" stroke="none" />
      <rect x="264" y="120" width="12" height="34" rx="3" fill="currentColor" stroke="none" />
      <rect x="130" y="172" width="80" height="20" rx="3" />
      <line x1="68" y1="198" x2="272" y2="198" strokeWidth={3} />
      <circle cx="105" cy="228" r="18" strokeWidth={3.5} />
      <circle cx="105" cy="228" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="235" cy="228" r="18" strokeWidth={3.5} />
      <circle cx="235" cy="228" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="170" cy="118" r="8" />
    </>
  )
}

function FrontViewContent() {
  return (
    <>
      <path d="M55,225 V155 L62,105 Q72,62 92,48 L112,38 Q135,28 170,26 Q205,28 228,38 L248,48 Q268,62 278,105 L285,155 V225 H262 Q235,192 208,225 H132 Q105,192 78,225 Z" />
      <path d="M100,92 Q112,52 132,40 L162,32 Q170,28 178,32 L208,40 Q228,52 240,92 Z" />
      <rect x="64" y="118" width="14" height="28" rx="4" fill="currentColor" stroke="none" />
      <rect x="262" y="118" width="14" height="28" rx="4" fill="currentColor" stroke="none" />
      <rect x="122" y="150" width="96" height="14" rx="3" />
      <rect x="135" y="174" width="70" height="18" rx="3" />
      <line x1="65" y1="200" x2="275" y2="200" strokeWidth={3} />
      <circle cx="105" cy="228" r="18" strokeWidth={3.5} />
      <circle cx="105" cy="228" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="235" cy="228" r="18" strokeWidth={3.5} />
      <circle cx="235" cy="228" r="3.5" fill="currentColor" stroke="none" />
    </>
  )
}

export function CarFrontSvg({ className }: CarSvgProps) {
  return (
    <svg viewBox="0 0 340 260" {...svgDefaults} className={className}>
      <FrontViewContent />
    </svg>
  )
}

export function CarBackSvg({ className }: CarSvgProps) {
  return (
    <svg viewBox="0 0 340 260" {...svgDefaults} className={className}>
      <BackViewContent />
    </svg>
  )
}

export function CarLeftSvg({ className }: CarSvgProps) {
  return (
    <svg viewBox="0 0 500 180" {...svgDefaults} className={className}>
      <SideViewContent />
    </svg>
  )
}

export function CarRightSvg({ className }: CarSvgProps) {
  return (
    <svg
      viewBox="0 0 500 180"
      {...svgDefaults}
      className={className}
      style={{ transform: 'scaleX(-1)' }}
    >
      <SideViewContent />
    </svg>
  )
}

export function CarFrontThumb({ className }: CarSvgProps) {
  return <CarFrontSvg className={className} />
}

export function CarBackThumb({ className }: CarSvgProps) {
  return <CarBackSvg className={className} />
}

export function CarLeftThumb({ className }: CarSvgProps) {
  return <CarLeftSvg className={className} />
}

export function CarRightThumb({ className }: CarSvgProps) {
  return <CarRightSvg className={className} />
}
