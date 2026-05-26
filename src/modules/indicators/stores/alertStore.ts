import { create } from 'zustand';
import type { Alert } from '../types';
import { generateInitialAlerts } from '../mocks/generator';

interface AlertState {
  alerts: Alert[];
  addAlert(a: Alert): void;
  acknowledge(id: string): void;
  silence(id: string): void;
  clear(): void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: generateInitialAlerts(20),

  addAlert: (a) =>
    set((s) => ({ alerts: [a, ...s.alerts].slice(0, 200) })),

  acknowledge: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    })),

  silence: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, silenced: true } : a)),
    })),

  clear: () => set({ alerts: [] }),
}));
