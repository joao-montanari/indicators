import { create } from 'zustand';
import type { SavedView, WidgetPreferences, FilterState } from '../types';

const STORAGE_KEY_VIEWS = 'ind:savedViews';
const STORAGE_KEY_PREFS = 'ind:widgetPrefs';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const defaultPrefs: WidgetPreferences = {
  showAlerts: true,
  showSensorHealth: true,
  showMaintenance: true,
  showFinancial: true,
  showHeatmap: true,
  showAnomalies: true,
};

interface PreferencesState {
  prefs: WidgetPreferences;
  savedViews: SavedView[];
  toggleWidget(key: keyof WidgetPreferences): void;
  saveView(name: string, filters: FilterState): void;
  deleteView(id: string): void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  prefs: loadJSON(STORAGE_KEY_PREFS, defaultPrefs),
  savedViews: loadJSON<SavedView[]>(STORAGE_KEY_VIEWS, []),

  toggleWidget: (key) => {
    const next = { ...get().prefs, [key]: !get().prefs[key] };
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(next));
    set({ prefs: next });
  },

  saveView: (name, filters) => {
    const view: SavedView = {
      id: `view-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    const next = [...get().savedViews, view];
    localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(next));
    set({ savedViews: next });
  },

  deleteView: (id) => {
    const next = get().savedViews.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(next));
    set({ savedViews: next });
  },
}));
