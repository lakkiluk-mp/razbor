'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function NavigationProgress() {
  return (
    <ProgressBar
      height="3px"
      color="#f59e0b"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
