import { useEffect, useRef } from 'react';
import { useAlertStore } from '../stores/alertStore';
import { generateNewAlert } from '../mocks/generator';

/**
 * Starts a simulated real-time stream.
 * – New alerts every 4-8 s
 * Mount this once at the dashboard level.
 */
export function useSimulator() {
  const addAlert = useAlertStore((s) => s.addAlert);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const tick = () => {
      addAlert(generateNewAlert());
    };

    // first alert after 2 s
    const timeout = setTimeout(() => {
      tick();
      intervalRef.current = setInterval(tick, 4_000 + Math.random() * 4_000);
    }, 2_000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addAlert]);
}
