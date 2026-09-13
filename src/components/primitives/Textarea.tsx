import type { TextareaHTMLAttributes } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, id, className = '', ...props }: TextareaProps) {
  const textareaId = id || props.name
  return (
    <label className="admin-field" htmlFor={textareaId}>
      {label && <span className="admin-label">{label}</span>}
      <textarea id={textareaId} className={`admin-input admin-textarea ${error ? 'admin-input-error' : ''} ${className}`} {...props} />
      {error ? <span className="admin-field-error">{error}</span> : hint ? <span className="admin-field-hint">{hint}</span> : null}
    </label>
  )
}
