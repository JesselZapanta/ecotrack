import { useEffect, useSyncExternalStore } from "react"
import { useLocation } from "react-router-dom"
import api, { TOKEN_KEY } from "./api"

export type NavBadgeKey = "concerns" | "missed" | "today"

export type NavBadgeCounts = Partial<Record<NavBadgeKey, number>>

const CACHE_TTL = 30_000
const EMPTY: NavBadgeCounts = {}

type BadgeState = {
  token: string | null
  counts: NavBadgeCounts
}

let state: BadgeState = { token: null, counts: EMPTY }
let fetchedAt = 0
let inFlight: Promise<void> | null = null
let queuedRefresh = false
const listeners = new Set<() => void>()

function token() {
  return localStorage.getItem(TOKEN_KEY)
}

function getSnapshot(): NavBadgeCounts {
  return state.token === token() ? state.counts : EMPTY
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function sameCounts(a: NavBadgeCounts, b: NavBadgeCounts) {
  return a.concerns === b.concerns && a.missed === b.missed && a.today === b.today
}

function load(force = false) {
  const activeToken = token()

  if (!activeToken) {
    fetchedAt = 0

    if (state.token !== null || state.counts !== EMPTY) {
      state = { token: null, counts: EMPTY }
      notify()
    }
    return
  }

  if (state.token !== activeToken) {
    state = { token: activeToken, counts: EMPTY }
    fetchedAt = 0
    notify()
  }

  if (!force && Date.now() - fetchedAt < CACHE_TTL) return

  if (inFlight) {
    if (force) queuedRefresh = true
    return
  }

  inFlight = api
    .get<{ data: NavBadgeCounts }>("/nav-badges")
    .then(({ data }) => {
      if (state.token !== activeToken) return

      fetchedAt = Date.now()
      const next = data.data ?? EMPTY

      if (!sameCounts(state.counts, next)) {
        state = { token: activeToken, counts: next }
        notify()
      }
    })
    .catch(() => {})
    .finally(() => {
      inFlight = null

      if (queuedRefresh) {
        queuedRefresh = false
        load(true)
      }
    })
}

export function refreshNavBadges() {
  load(true)
}

export function useNavBadges(): NavBadgeCounts {
  const { pathname } = useLocation()
  const counts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 350)

    return () => window.clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    const onFocus = () => load()

    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  return counts
}
