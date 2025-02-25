import { useEffect, useState } from 'react'

export const useRefreshKey = (deps: unknown[]) => {
  const [refreshKey, setRefreshKey] = useState(Date.now())

  useEffect(() => {
    requestAnimationFrame(() => {
      setRefreshKey(Date.now())
    })
  }, [deps])

  return {
    refreshKey,
  }
}
