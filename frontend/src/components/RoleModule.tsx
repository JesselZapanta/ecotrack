import type { ComponentType } from "react"
import { useAuth } from "@/lib/store"

type Props = {
  admin?: ComponentType
  maintenance?: ComponentType
  fallback?: ComponentType
}

export function RoleModule({ admin, maintenance, fallback }: Props) {
  const { role } = useAuth()

  const Page = role === "admin" ? admin ?? fallback : maintenance ?? fallback

  return Page ? <Page /> : null
}
