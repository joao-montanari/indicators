import { useQuery } from '@tanstack/react-query';
import { useFilterStore } from '../stores/filterStore';
import { useShallow } from 'zustand/react/shallow';
import type { FilterState } from '../types';
import {
  fetchKpis, fetchTrend, fetchSectorConsumption,
  fetchDeviceDistribution, fetchHeatmap, fetchAnomalies,
  fetchFinancial, fetchSensorMetrics, fetchEquipment,
  fetchMaintenanceHistory,
} from '../services/api';

function useFilters(): FilterState {
  return useFilterStore(useShallow((s) => ({
    timeRange: s.timeRange,
    comparePrevious: s.comparePrevious,
    siteId: s.siteId,
    buildingId: s.buildingId,
    floorId: s.floorId,
    sectorId: s.sectorId,
    roomId: s.roomId,
    deviceCategory: s.deviceCategory,
    deviceStatus: s.deviceStatus,
  })));
}

export function useKpis() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['kpis', filters],
    queryFn: () => fetchKpis(filters),
    refetchInterval: 5_000,
  });
}

export function useTrend() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['trend', filters],
    queryFn: () => fetchTrend(filters),
    refetchInterval: 30_000,
  });
}

export function useSectorConsumption() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['sectorConsumption', filters],
    queryFn: () => fetchSectorConsumption(filters),
    refetchInterval: 15_000,
  });
}

export function useDeviceDistribution() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['deviceDistribution', filters],
    queryFn: () => fetchDeviceDistribution(filters),
    refetchInterval: 20_000,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ['heatmap'],
    queryFn: fetchHeatmap,
    refetchInterval: 60_000,
  });
}

export function useAnomalies() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['anomalies', filters],
    queryFn: () => fetchAnomalies(filters),
    refetchInterval: 20_000,
  });
}

export function useFinancial() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['financial', filters],
    queryFn: () => fetchFinancial(filters),
    refetchInterval: 30_000,
  });
}

export function useSensorMetrics() {
  const filters = useFilters();
  return useQuery({
    queryKey: ['sensorMetrics', filters],
    queryFn: () => fetchSensorMetrics(filters),
    refetchInterval: 10_000,
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
    refetchInterval: 30_000,
  });
}

export function useMaintenanceHistory() {
  return useQuery({
    queryKey: ['maintenanceHistory'],
    queryFn: fetchMaintenanceHistory,
    refetchInterval: 60_000,
  });
}
