const TOKEN_KEY = 'gamecity_token'

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string) {
    if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY)
  },
}

export { TOKEN_KEY }
