import { useState, useCallback } from "react"

/**
 * Generic hook for API calls with loading/error state.
 */
export function useApi<T, Args extends unknown[]>(
  apiFn: (...args: Args) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiFn(...args)
        setData(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFn]
  )

  return { data, loading, error, execute }
}
