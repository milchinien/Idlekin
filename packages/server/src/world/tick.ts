import type { Clock } from '@idlekin/shared';

export function createTickLoop(clock: Clock, tick: (stepMs: number) => void, schedule = setTimeout) {
  const stepMs = 50; let previous = clock.now(); let accumulator = 0; let stopped = false;
  const frame = () => { if (stopped) return; const now = clock.now(); accumulator += Math.min(now - previous, stepMs * 5); previous = now; let count = 0;
    while (accumulator >= stepMs && count < 5) { const started = clock.now(); tick(stepMs); const duration = clock.now() - started; if (duration >= 25) console.warn(`Langsamer Tick: ${duration.toFixed(1)} ms`); accumulator -= stepMs; count += 1; }
    schedule(frame, Math.max(1, stepMs - accumulator));
  }; schedule(frame, stepMs); return () => { stopped = true; };
}
