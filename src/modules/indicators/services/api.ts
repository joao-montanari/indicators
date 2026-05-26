/**
 * Mock API service layer.
 *
 * Each function returns a Promise with simulated latency.
 * To replace with a real backend, swap these implementations
 * with actual fetch/axios calls — the signatures stay the same.
 */
import type {
  FilterState, KpiData, TimeSeriesPoint, SectorConsumption,
  HeatmapCell, AnomalyRanking, FinancialEntry, DeviceDistributionItem,
  SensorMetrics, Equipment, MaintenanceEvent,
} from '../types';
import {
  generateKpis, generateTrend, generateSectorConsumption,
  generateDeviceDistribution, generateHeatmap, generateAnomalies,
  generateFinancial, generateSensorMetrics, generateEquipment,
  generateMaintenanceHistory,
} from '../mocks/generator';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const latency = () => delay(200 + Math.random() * 300);

export async function fetchKpis(filters: FilterState): Promise<KpiData> {
  await latency();
  return generateKpis(filters);
}

export async function fetchTrend(filters: FilterState): Promise<{ current: TimeSeriesPoint[]; previous: TimeSeriesPoint[] }> {
  await latency();
  return generateTrend(filters);
}

export async function fetchSectorConsumption(filters: FilterState): Promise<SectorConsumption[]> {
  await latency();
  return generateSectorConsumption(filters);
}

export async function fetchDeviceDistribution(filters: FilterState): Promise<DeviceDistributionItem[]> {
  await latency();
  return generateDeviceDistribution(filters);
}

export async function fetchHeatmap(): Promise<HeatmapCell[]> {
  await latency();
  return generateHeatmap();
}

export async function fetchAnomalies(filters: FilterState): Promise<AnomalyRanking[]> {
  await latency();
  return generateAnomalies(filters);
}

export async function fetchFinancial(filters: FilterState): Promise<FinancialEntry[]> {
  await latency();
  return generateFinancial(filters);
}

export async function fetchSensorMetrics(filters: FilterState): Promise<SensorMetrics[]> {
  await latency();
  return generateSensorMetrics(filters);
}

export async function fetchEquipment(): Promise<Equipment[]> {
  await latency();
  return generateEquipment();
}

export async function fetchMaintenanceHistory(): Promise<MaintenanceEvent[]> {
  await latency();
  return generateMaintenanceHistory();
}
