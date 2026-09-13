import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export function Table({ className = '', children, ...props }: HTMLAttributes<HTMLTableElement> & { children?: ReactNode }) {
  return <div className="admin-table-wrap"><table className={`admin-table ${className}`} {...props}>{children}</table></div>
}

export function TableHeader({ className = '', children, ...props }: HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode }) {
  return <thead className={className} {...props}>{children}</thead>
}

export function TableBody({ className = '', children, ...props }: HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode }) {
  return <tbody className={className} {...props}>{children}</tbody>
}

export function TableRow({ className = '', children, ...props }: HTMLAttributes<HTMLTableRowElement> & { children?: ReactNode }) {
  return <tr className={className} {...props}>{children}</tr>
}

export function TableHead({ className = '', children, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return <th className={`admin-table-head ${className}`} {...props}>{children}</th>
}

export function TableCell({ className = '', children, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return <td className={`admin-table-cell ${className}`} {...props}>{children}</td>
}
