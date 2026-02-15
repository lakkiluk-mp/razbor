declare global {
  interface Window {
    YooMoneyCheckoutWidget: new (config: {
      confirmation_token: string
      return_url?: string
      customization?: {
        colors?: {
          control_primary?: string
          background?: string
        }
      }
      error_callback?: (error: unknown) => void
    }) => {
      render: (containerId: string) => Promise<void>
      destroy: () => void
      on: (event: 'success' | 'fail', callback: () => void) => void
    }
  }
}

export {}
