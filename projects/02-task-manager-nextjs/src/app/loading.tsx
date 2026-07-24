export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4 mb-4" />
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-300 dark:border-slate-800" />
        ))}
      </div>
    </div>
  );
}
