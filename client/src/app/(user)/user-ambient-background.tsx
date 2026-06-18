export default function AuthAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-background absolute inset-0" />

      <div className="landing-glow-mint text-accent absolute left-1/2 top-[-20rem] h-[52rem] w-[86rem] -translate-x-1/2 rounded-full opacity-95 blur-3xl dark:opacity-55" />

      <div className="bg-accent/20 dark:bg-accent/15 absolute right-[-18rem] top-1/4 h-[36rem] w-[36rem] rounded-full blur-3xl" />

      <div className="bg-success/20 dark:bg-success/15 absolute bottom-[-20rem] left-[-14rem] h-[36rem] w-[36rem] rounded-full blur-3xl" />

      <div className="from-background/70 via-background/40 dark:from-background dark:via-background/75 absolute inset-x-0 top-0 h-72 bg-gradient-to-b to-transparent" />

      <div className="from-background/60 to-background/80 dark:from-background dark:to-background absolute inset-0 bg-gradient-to-b via-transparent" />
    </div>
  );
}
