import { useCallback, useEffect, useRef, useState } from 'react'

const POLL_INTERVAL = 200
const POLL_TIMEOUT = 10_000

interface UseYooKassaWidgetParams {
  confirmationToken: string | null
  containerId: string
  onSuccess: () => void
  onFail: () => void
}

type YooKassaWidgetInstance = InstanceType<typeof window.YooMoneyCheckoutWidget>

interface UseYooKassaWidgetResult {
  isReady: boolean
  isLoading: boolean
  error: string | null
}

export function useYooKassaWidget({
  confirmationToken,
  containerId,
  onSuccess,
  onFail,
}: UseYooKassaWidgetParams): UseYooKassaWidgetResult {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<YooKassaWidgetInstance | null>(null)
  const onSuccessRef = useRef(onSuccess)
  const onFailRef = useRef(onFail)

  onSuccessRef.current = onSuccess
  onFailRef.current = onFail

  const initWidget = useCallback(
    (token: string, container: string) => {
      const widget = new window.YooMoneyCheckoutWidget({
        confirmation_token: token,
        return_url: `${window.location.origin}/#/payment/success`,
        customization: {
          colors: {
            control_primary: '#F59E0B',
            background: '#18181b',
          },
        },
        error_callback: (err) => setError(String(err)),
      })

      widgetRef.current = widget

      widget.on('success', () => onSuccessRef.current())
      widget.on('fail', () => onFailRef.current())

      widget
        .render(container)
        .then(() => {
          setIsReady(true)
          setIsLoading(false)
        })
        .catch((err: unknown) => {
          setError(String(err))
          setIsLoading(false)
        })
    },
    [],
  )

  useEffect(() => {
    if (!confirmationToken) return

    setIsReady(false)
    setError(null)
    setIsLoading(true)

    if (window.YooMoneyCheckoutWidget) {
      initWidget(confirmationToken, containerId)
      return () => {
        widgetRef.current?.destroy()
      }
    }

    let elapsed = 0
    const intervalId = setInterval(() => {
      elapsed += POLL_INTERVAL

      if (window.YooMoneyCheckoutWidget) {
        clearInterval(intervalId)
        initWidget(confirmationToken, containerId)
        return
      }

      if (elapsed >= POLL_TIMEOUT) {
        clearInterval(intervalId)
        setError('YooKassa widget script failed to load')
        setIsLoading(false)
      }
    }, POLL_INTERVAL)

    return () => {
      clearInterval(intervalId)
      widgetRef.current?.destroy()
    }
  }, [confirmationToken, containerId, initWidget])

  return { isReady, isLoading, error }
}
