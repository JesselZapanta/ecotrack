import axios from "axios"
import api from "@/lib/api"
import type { AuthUser } from "@/lib/store"

export type ProfilePayload = {
  name: string
  username: string | null
  email: string
}

export type PasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export async function updateProfile(payload: ProfilePayload): Promise<AuthUser> {
  const { data } = await api.patch<{ user: AuthUser }>("/auth/account", payload)
  return data.user
}

export async function changePassword(payload: PasswordPayload): Promise<string> {
  const { data } = await api.patch<{ message: string }>("/auth/account/password", payload)
  return data.message
}

export function accountMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return first ?? data?.message ?? "Something went wrong. Try again."
  }
  return "Something went wrong. Try again."
}

export function accountErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string[]> } | undefined
    if (data?.errors) {
      return Object.fromEntries(
        Object.entries(data.errors).map(([field, messages]) => [field, messages[0] ?? "Invalid value."])
      )
    }
  }
  return {}
}
