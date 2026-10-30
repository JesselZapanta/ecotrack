import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { UserFormDialog } from "@/admin/user/components/UserFormDialog"
import { UsersTable } from "@/admin/user/components/UsersTable"
import { UsersToolbar } from "@/admin/user/components/UsersToolbar"
import { apiMessage, getOffices, getUsers, setUserStatus } from "@/admin/user/api"
import type {
  ApiUser,
  Meta,
  OfficeOption,
  SortColumn,
  SortDirection,
} from "@/admin/user/types"
import { AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [role, setRole] = useState("all")
  const [status, setStatus] = useState("all")
  const [office, setOffice] = useState("all")
  const [sort, setSort] = useState<SortColumn>("id")
  const [direction, setDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [refreshKey, setRefreshKey] = useState(0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ApiUser | null>(null)
  const [confirmUser, setConfirmUser] = useState<ApiUser | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    getOffices()
      .then(setOffices)
      .catch(() => setOffices([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    getUsers({
      search: debouncedQuery,
      role,
      status,
      officeId: office,
      sort,
      direction,
      perPage,
      page,
    })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setUsers(data)
        setMeta(nextMeta)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(apiMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, role, status, office, sort, direction, page, perPage, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (user: ApiUser) => {
    setEditing(user)
    setDialogOpen(true)
  }

  const confirmStatusChange = async () => {
    if (!confirmUser) return

    try {
      const message = await setUserStatus(confirmUser.id, !confirmUser.is_active)
      toast.success(message)
      setConfirmUser(null)
      refresh()
    } catch (err) {
      toast.error(apiMessage(err))
      throw err
    }
  }

  const toggleSort = (column: SortColumn) => {
    setLoading(true)
    if (sort === column) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setSort(column)
      setDirection("asc")
    }
    setPage(1)
  }

  const clearFilters = () => {
    setLoading(true)
    setQuery("")
    setDebouncedQuery("")
    setRole("all")
    setStatus("all")
    setOffice("all")
    setPage(1)
  }

  const filtersActive = query !== "" || role !== "all" || status !== "all" || office !== "all"

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Access control"
        title="Users"
        subtitle={
          loading
            ? "Updating accounts…"
            : meta
              ? `${meta.total} accounts · server-side search, filters and pagination`
              : "Loading accounts…"
        }
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add user
          </Button>
        }
      />

      <UsersToolbar
        query={query}
        onQueryChange={(value) => {
          setQuery(value)
          setLoading(true)
        }}
        role={role}
        onRoleChange={(value) => {
          setLoading(true)
          setRole(value)
          setPage(1)
        }}
        status={status}
        onStatusChange={(value) => {
          setLoading(true)
          setStatus(value)
          setPage(1)
        }}
        office={office}
        onOfficeChange={(value) => {
          setLoading(true)
          setOffice(value)
          setPage(1)
        }}
        offices={offices}
        filtersActive={filtersActive}
        loading={loading}
        onClear={clearFilters}
      />

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertCircle className="size-5 text-alarm" />
            <p className="text-[13px] text-ink">{error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <UsersTable
          users={users}
          meta={meta}
          loading={loading}
          sort={sort}
          direction={direction}
          perPage={perPage}
          onSort={toggleSort}
          onEdit={openEdit}
          onToggle={setConfirmUser}
          onPerPageChange={(value) => {
            setLoading(true)
            setPerPage(value)
            setPage(1)
          }}
          onPageChange={(nextPage) => {
            setLoading(true)
            setPage(nextPage)
          }}
        />
      )}

      {dialogOpen && (
        <UserFormDialog
          editing={editing}
          offices={offices}
          onClose={() => {
            setDialogOpen(false)
            setEditing(null)
          }}
          onSaved={() => {
            refresh()
            setPage(1)
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmUser}
        onOpenChange={(open) => !open && setConfirmUser(null)}
        title={
          confirmUser?.is_active
            ? `Deactivate ${confirmUser.name}?`
            : `Activate ${confirmUser?.name ?? "this user"}?`
        }
        description={
          confirmUser?.is_active
            ? "They will no longer be able to sign in. You can reactivate the account at any time."
            : "They will be able to sign in again with their existing password."
        }
        confirmLabel={confirmUser?.is_active ? "Deactivate user" : "Activate user"}
        variant={confirmUser?.is_active ? "destructive" : "default"}
        onConfirm={confirmStatusChange}
      />
    </div>
  )
}
