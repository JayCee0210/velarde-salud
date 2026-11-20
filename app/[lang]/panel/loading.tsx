export default function LoadingPanel() {
  return <div className="mx-auto max-w-7xl space-y-5 px-4 py-5" aria-busy="true"><div className="h-8 w-48 animate-pulse rounded-lg bg-white/80" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="h-24 animate-pulse rounded-2xl bg-white/80" /><div className="h-24 animate-pulse rounded-2xl bg-white/80" /><div className="h-24 animate-pulse rounded-2xl bg-white/80" /><div className="h-24 animate-pulse rounded-2xl bg-white/80" /></div><div className="h-64 animate-pulse rounded-2xl bg-white/80" /></div>;
}
