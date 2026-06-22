export default function AmbientBackground() {
  return (
    <div className="text-accent pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="landing-glow-mint absolute left-1/2 top-[-14rem] h-[38rem] w-[62rem] -translate-x-1/2 rounded-full blur-2xl" />
      <div className="landing-grid-overlay text-muted absolute inset-0 dark:text-white" />
      <div className="from-background via-background/60 absolute inset-x-0 top-0 h-96 bg-gradient-to-b to-transparent dark:from-zinc-950 dark:via-zinc-950/60" />
    </div>
  );
}
