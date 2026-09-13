import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount <= 1) return null
  return (
    <div className="admin-pagination" aria-label="Pagination">
      <Button variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}><ChevronLeft size={16} /> Previous</Button>
      <span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span>
      <Button variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={page >= pageCount}>Next <ChevronRight size={16} /></Button>
    </div>
  )
}
