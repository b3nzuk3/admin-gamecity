const DEFAULT_API_BASE_URL = 'http://localhost:5001/api'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export const adminEnv = {
  apiBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  ),
  storefrontUrl:
    import.meta.env.VITE_STOREFRONT_URL ||
    'https://www.gamecityelectronics.co.ke',
  adminUrl:
    import.meta.env.VITE_ADMIN_URL ||
    'https://admin.gamecityelectronics.co.ke',
}

export function isConfiguredApiUrl() {
  return Boolean(import.meta.env.VITE_API_BASE_URL)
}
