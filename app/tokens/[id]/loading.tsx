export default function TokenLoading() {
  return (
    <div className="pb-16">
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="sheet aspect-square bg-card-2" />
          <div>
            <div className="h-10 w-56 bg-ink/10" />
            <div className="mt-4 h-5 w-36 bg-ink/10" />
            <div className="well mt-8 h-32" />
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="sheet h-56" />
          <div className="sheet h-56" />
        </div>
      </div>
    </div>
  );
}
