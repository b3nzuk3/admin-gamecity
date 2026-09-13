import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { Input } from './Input'
import { Button } from './Button'

export function SearchInput({ value, onChange, placeholder = 'Search...', label = 'Search' }: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string }) {
  const id = useId()
  return (
    <div className="admin-search-input">
      <Search size={17} aria-hidden="true" />
      <Input id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <Button variant="icon" size="sm" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onChange('')}><X size={15} /></Button>}
    </div>
  )
}
