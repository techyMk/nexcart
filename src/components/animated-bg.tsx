export function AnimatedBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-60" />
      {/* Orbs: static radial gradients (no filter layer) animated with
          compositor-friendly CSS only — outer div drifts, inner div pulses. */}
      <div className="absolute -top-32 -left-32 h-[480px] w-[480px] opacity-50 dark:opacity-100 motion-safe:animate-drift [animation-duration:26s]">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.28),transparent_70%)] motion-safe:animate-pulse-slow [animation-duration:8s]" />
      </div>
      <div className="absolute top-40 right-[-160px] h-[520px] w-[520px] opacity-50 dark:opacity-100 motion-safe:animate-drift [animation-duration:34s]">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.28),transparent_70%)] motion-safe:animate-pulse-slow [animation-duration:10s] [animation-delay:2s]" />
      </div>
      <div className="absolute bottom-[-220px] left-1/3 h-[600px] w-[600px] opacity-50 dark:opacity-100 motion-safe:animate-drift [animation-duration:40s]">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.18),transparent_70%)] motion-safe:animate-pulse-slow [animation-duration:12s] [animation-delay:4s]" />
      </div>
      <div className="absolute inset-0 hidden noise opacity-[0.04] md:block" />
    </div>
  );
}
