import { create } from 'zustand';
import dayjs from 'dayjs';
import type {
  FilterState, TimePreset, DeviceCategory, DeviceStatus, SavedView,
} from '../types';

function buildTimeRange(preset: Exclude<TimePreset, 'custom'>) {
  const end = dayjs().toISOString();
  const startMap: Record<Exclude<TimePreset, 'custom'>, dayjs.Dayjs> = {
    '24h': dayjs().subtract(24, 'hour'),
    '7d': dayjs().subtract(7, 'day'),
    '30d': dayjs().subtract(30, 'day'),
    '90d': dayjs().subtract(90, 'day'),
    YTD: dayjs().startOf('year'),
  };
  return { preset, start: startMap[preset].toISOString(), end };
}

const defaultFilters: FilterState = {
  timeRange: buildTimeRange('24h'),
  comparePrevious: false,
  siteId: null,
  buildingId: null,
  floorId: null,
  sectorId: null,
  roomId: null,
  deviceCategory: null,
  deviceStatus: null,
};

interface FilterActions {
  setTimePreset(p: Exclude<TimePreset, 'custom'>): void;
  setCustomRange(start: string, end: string): void;
  toggleComparePrevious(): void;
  setSite(id: string | null): void;
  setBuilding(id: string | null): void;
  setFloor(id: string | null): void;
  setSector(id: string | null): void;
  setRoom(id: string | null): void;
  setDeviceCategory(c: DeviceCategory | null): void;
  setDeviceStatus(s: DeviceStatus | null): void;
  resetFilters(): void;
  applyView(v: SavedView): void;
}

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...defaultFilters,

  setTimePreset: (p) => set({ timeRange: buildTimeRange(p) }),
  setCustomRange: (start, end) => set({ timeRange: { preset: 'custom', start, end } }),
  toggleComparePrevious: () => set((s) => ({ comparePrevious: !s.comparePrevious })),
  setSite: (siteId) => set({ siteId, buildingId: null, floorId: null, sectorId: null, roomId: null }),
  setBuilding: (buildingId) => set({ buildingId, floorId: null, sectorId: null, roomId: null }),
  setFloor: (floorId) => set({ floorId, sectorId: null, roomId: null }),
  setSector: (sectorId) => set({ sectorId, roomId: null }),
  setRoom: (roomId) => set({ roomId }),
  setDeviceCategory: (deviceCategory) => set({ deviceCategory }),
  setDeviceStatus: (deviceStatus) => set({ deviceStatus }),
  resetFilters: () => set(defaultFilters),
  applyView: (v) => set({ ...v.filters }),
}));
