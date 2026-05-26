export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 ${className}`}
      style={style}
      aria-hidden
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-3">
      <Skeleton style={{ height: 14, width: '60%' }} />
      <Skeleton style={{ height: 32, width: '45%' }} />
      <Skeleton style={{ height: 12, width: '35%' }} />
      <Skeleton style={{ height: 40, width: '100%' }} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 space-y-3">
      <Skeleton style={{ height: 18, width: '40%' }} />
      <Skeleton style={{ height: 280, width: '100%' }} />
    </div>
  );
}
