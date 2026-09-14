import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({ page, pageCount, onChange, disabled = false }: { page: number; pageCount: number; onChange: (page: number) => void; disabled?: boolean }) {
  if (pageCount <= 1) return null
  return (
    <div className="admin-pagination" aria-label="Pagination">
      <Button variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={disabled || page <= 1}><ChevronLeft size={16} /> Previous</Button>
      <span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span>
      <Button variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={disabled || page >= pageCount}>Next <ChevronRight size={16} /></Button>
    </div>
  )
}
