import type { SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  options?: Array<{ value: string; label: string }>
}

export function Select({ label, hint, error, options, id, className = '', children, ...props }: SelectProps) {
  const selectId = id || props.name
  return (
    <label className="admin-field" htmlFor={selectId}>
      {label && <span className="admin-label">{label}</span>}
      <select id={selectId} className={`admin-input admin-select ${error ? 'admin-input-error' : ''} ${className}`} {...props}>
        {options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        {children}
      </select>
      {error ? <span className="admin-field-error">{error}</span> : hint ? <span className="admin-field-hint">{hint}</span> : null}
    </label>
  )
}
