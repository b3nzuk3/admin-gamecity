import type { ReactNode } from 'react'

export function Toast({ message, tone = 'info' }: { message: string; tone?: 'info' | 'success' | 'error'; }) {
  return <div className={`admin-toast admin-toast-${tone}`} role="status">{message}</div>
}

export function ToastRegion({ children }: { children?: ReactNode }) {
  return <div className="admin-toast-region" aria-live="polite">{children}</div>
}
