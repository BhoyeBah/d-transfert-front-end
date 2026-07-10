export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/25 px-6 py-12 text-center text-sm text-muted-foreground shadow-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Aucun contenu
      </div>
      <div className="max-w-sm">{message}</div>
    </div>
  );
}
