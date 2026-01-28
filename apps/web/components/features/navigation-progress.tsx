'use client'

import NextTopLoader from 'nextjs-toploader'

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#f59e0b"
      height={4}
      showSpinner={false}
      shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
    />
  )
}
