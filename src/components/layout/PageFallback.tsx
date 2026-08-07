export function PageFallback() {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-4 w-72 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}