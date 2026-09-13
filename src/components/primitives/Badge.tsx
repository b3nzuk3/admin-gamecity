import type { HTMLAttributes } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export function Badge({ tone = 'neutral', className = '', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={`admin-badge admin-badge-${tone} ${className}`} {...props} />
}
