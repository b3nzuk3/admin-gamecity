import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <section className={`admin-card ${className}`} {...props}>{children}</section>
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={`admin-card-header ${className}`} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return <h2 className={`admin-card-title ${className}`} {...props}>{children}</h2>
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={`admin-card-content ${className}`} {...props}>{children}</div>
}
