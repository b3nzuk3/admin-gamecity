import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, id, className = '', ...props }: InputProps) {
  const inputId = id || props.name
  return (
    <label className="admin-input-wrap" htmlFor={inputId}>
      {label && <span className="admin-input-label">{label}</span>}
      <input id={inputId} className={`admin-input ${error ? 'admin-input-error' : ''} ${className}`} {...props} />
      {error ? <span className="admin-input-error">{error}</span> : hint ? <span className="admin-input-hint">{hint}</span> : null}
    </label>
  )
}
