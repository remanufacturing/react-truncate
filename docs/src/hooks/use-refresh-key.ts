import { useEffect, useMemo, useState } from 'react'

export const useRefreshKey = (deps: unknown[]) => {
  const [refreshKey, setRefreshKey] = useState(Date.now())

  /**
   * Ensure dependencies are stable between renders. If deps is an array,
   * convert it to a string to prevent infinite loops.
   *
   * ⚠️ Note: `Array.prototype.toString()` is a shallow and order-sensitive
   * representation. It may not behave as expected for objects or nested arrays.
   * For more accurate results, consider using JSON.stringify() or a deep
   * comparison function like lodash.isEqual().
   */
  const effectDeps = useMemo(
    () => (Array.isArray(deps) ? deps.toString() : deps),
    [deps],
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      setRefreshKey(Date.now())
    })
  }, [effectDeps])

  return {
    refreshKey,
  }
}
