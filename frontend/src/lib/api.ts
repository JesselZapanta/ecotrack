import axios from "axios"

export const TOKEN_KEY = "ecotrack_token"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { Accept: "application/json" },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url: string = error?.config?.url ?? ""

    if (status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event("ecotrack:unauthorized"))
    }

    return Promise.reject(error)
  }
)

export default api
