export default function TokensLoading() {
  return (
    <div className="pb-24">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-8">
        <div className="h-10 w-48 rounded-md bg-ink/10" />
        <div className="mt-4 h-4 w-72 rounded-md bg-ink/10" />
      </div>
      <div className="mx-auto max-w-6xl px-5">
        <div className="sheet overflow-hidden">
          <div className="h-12 border-b border-line" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-line last:border-b-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
