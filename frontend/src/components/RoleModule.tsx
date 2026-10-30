import type { ComponentType } from "react"
import { useAuth } from "@/lib/store"

type Props = {
  admin?: ComponentType
  office?: ComponentType
  maintenance?: ComponentType
  fallback?: ComponentType
}

export function RoleModule({ admin, office, maintenance, fallback }: Props) {
  const { role } = useAuth()

  const Page =
    role === "admin" ? admin ?? fallback : role === "office" ? office ?? fallback : maintenance ?? fallback

  return Page ? <Page /> : null
}
