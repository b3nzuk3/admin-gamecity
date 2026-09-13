export function Skeleton({ width = '100%', height = '1rem', className = '' }: { width?: string; height?: string; className?: string }) {
  return <span className={`admin-skeleton ${className}`} style={{ width, height }} aria-hidden="true" />
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return <div className="admin-skeleton-block" aria-label="Loading"><Skeleton height="1.5rem" width="45%" />{Array.from({ length: lines }, (_, index) => <Skeleton key={index} height="0.9rem" width={`${82 - index * 9}%`} />)}</div>
}
