import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { concernMessage, getConcerns, updateConcernStatus } from "./api"
import type { ApiConcern, ConcernStatus, Meta } from "./api"

export function useConcerns(initialPerPage = 10) {
  const [concerns, setConcerns] = useState<ApiConcern[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [refreshKey, setRefreshKey] = useState(0)
  const [workingId, setWorkingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false

    getConcerns({ search: debouncedQuery, status, page, perPage })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setConcerns(data)
        setMeta(nextMeta)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(concernMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, status, page, perPage, refreshKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }, [])

  const search = useCallback((value: string) => {
    setLoading(true)
    setQuery(value)
  }, [])

  const filterStatus = useCallback((value: string) => {
    setLoading(true)
    setStatus(value)
    setPage(1)
  }, [])

  const goToPage = useCallback((next: number) => {
    setLoading(true)
    setPage(next)
  }, [])

  const changePerPage = useCallback((next: number) => {
    setLoading(true)
    setPerPage(next)
    setPage(1)
  }, [])

  const changeStatus = useCallback(
    async (concern: ApiConcern, next: ConcernStatus, note?: string): Promise<boolean> => {
      setWorkingId(concern.id)
      try {
        const updated = await updateConcernStatus(concern.id, next, note)
        setConcerns((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        toast.success(next === "Resolved" ? "Concern resolved." : `Concern marked as ${next.toLowerCase()}.`)
        return true
      } catch (err) {
        toast.error(concernMessage(err))
        return false
      } finally {
        setWorkingId(null)
      }
    },
    []
  )

  return {
    concerns,
    meta,
    loading,
    error,
    query,
    status,
    page,
    perPage,
    workingId,
    search,
    filterStatus,
    goToPage,
    changePerPage,
    changeStatus,
    refresh,
  }
}
