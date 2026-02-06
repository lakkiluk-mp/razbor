/// <reference types="vite/client" />

interface TelegramWebApp {
  ready(): void
  expand(): void
  close(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  initData: string
  initDataUnsafe: Record<string, unknown>
  isExpanded: boolean
  MainButton: {
    show(): void
    hide(): void
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  BackButton: {
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openInvoice(url: string, callback?: (status: string) => void): void
  requestFullscreen?(): void
  isFullscreen?: boolean
  disableVerticalSwipes?(): void
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}
