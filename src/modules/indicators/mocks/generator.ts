import dayjs from 'dayjs';
import type {
  FilterState, KpiData, TimeSeriesPoint, SectorConsumption,
  HeatmapCell, AnomalyRanking, FinancialEntry, DeviceDistributionItem,
  SensorMetrics, Equipment, MaintenanceEvent, Alert, SeverityLevel,
} from '../types';
import { createRng, liveSeed } from '../utils/seedRng';
import {
  sectors, devices, equipmentList, alertTemplates,
  getSectorName,
} from './data';

// ─── Helpers ────────────────────────────────────────────
function timePoints(start: string, end: string, maxPoints: number): string[] {
  const s = dayjs(start);
  const e = dayjs(end);
  const diff = e.diff(s, 'minute');
  const step = Math.max(1, Math.floor(diff / maxPoints));
  const pts: string[] = [];
  let cur = s;
  while (cur.isBefore(e)) {
    pts.push(cur.toISOString());
    cur = cur.add(step, 'minute');
  }
  return pts;
}

function filteredSectors(filters: FilterState) {
  let list = sectors;
  if (filters.sectorId) list = list.filter((s) => s.id === filters.sectorId);
  if (filters.floorId) list = list.filter((s) => s.floorId === filters.floorId);
  return list;
}

function filteredDevices(filters: FilterState) {
  let list = devices;
  if (filters.sectorId) list = list.filter((d) => d.sectorId === filters.sectorId);
  if (filters.deviceCategory) list = list.filter((d) => d.category === filters.deviceCategory);
  if (filters.deviceStatus) list = list.filter((d) => d.status === filters.deviceStatus);
  return list;
}

// ─── KPI ────────────────────────────────────────────────
export function generateKpis(filters: FilterState): KpiData {
  const seed = liveSeed();
  const rng = createRng(seed + 1);

  const base = 42_500 + rng() * 5_000;
  const prev = base * (0.9 + rng() * 0.15);
  const costRate = 0.85 + rng() * 0.1;

  const devs = filteredDevices(filters);
  const online = devs.filter((d) => d.status === 'online').length;
  const total = devs.length || 1;

  const eqCount = equipmentList.length;
  const eqOperating = Math.round(eqCount * (0.75 + rng() * 0.2));

  const alertCounts: Record<SeverityLevel, number> = {
    info: Math.floor(3 + rng() * 8),
    warning: Math.floor(2 + rng() * 6),
    critical: Math.floor(rng() * 4),
    emergency: Math.floor(rng() * 2),
  };

  const health = Math.round(68 + rng() * 28);
  const prevHealth = Math.round(health + (rng() - 0.5) * 10);

  const sparkLen = 12;
  const consumptionSpark: number[] = [];
  const costSpark: number[] = [];
  const healthSpark: number[] = [];
  const sparkRng = createRng(seed + 2);
  for (let i = 0; i < sparkLen; i++) {
    consumptionSpark.push(base * (0.85 + sparkRng() * 0.3));
    costSpark.push(base * costRate * (0.85 + sparkRng() * 0.3));
    healthSpark.push(Math.round(60 + sparkRng() * 35));
  }

  return {
    totalConsumption: Math.round(base),
    previousConsumption: Math.round(prev),
    estimatedCost: Math.round(base * costRate),
    previousCost: Math.round(prev * costRate),
    activeAlerts: alertCounts,
    sensorsOnline: online,
    sensorsTotal: total,
    equipmentsOperating: eqOperating,
    equipmentsTotal: eqCount,
    healthScore: health,
    previousHealthScore: prevHealth,
    consumptionSparkline: consumptionSpark,
    costSparkline: costSpark,
    healthSparkline: healthSpark,
  };
}

// ─── Time series ────────────────────────────────────────
export function generateTrend(filters: FilterState): { current: TimeSeriesPoint[]; previous: TimeSeriesPoint[] } {
  const pts = timePoints(filters.timeRange.start, filters.timeRange.end, 120);
  const seed = liveSeed(30_000);
  const rng = createRng(seed + 10);

  const current = pts.map((t, i) => {
    const hour = dayjs(t).hour();
    const dayFactor = hour >= 8 && hour <= 18 ? 1.3 : 0.7;
    return { timestamp: t, value: Math.round((300 + rng() * 200) * dayFactor + Math.sin(i / 10) * 50) };
  });

  const prevRng = createRng(seed + 11);
  const previous = pts.map((t, i) => {
    const hour = dayjs(t).hour();
    const dayFactor = hour >= 8 && hour <= 18 ? 1.25 : 0.72;
    return {
      timestamp: dayjs(t).subtract(dayjs(filters.timeRange.end).diff(dayjs(filters.timeRange.start)), 'millisecond').toISOString(),
      value: Math.round((290 + prevRng() * 190) * dayFactor + Math.sin(i / 10) * 45),
    };
  });

  return { current, previous };
}

// ─── Sector consumption ─────────────────────────────────
export function generateSectorConsumption(filters: FilterState): SectorConsumption[] {
  const secs = filteredSectors(filters);
  const rng = createRng(liveSeed(15_000) + 20);
  return secs.map((s) => {
    const value = Math.round(1200 + rng() * 8000);
    const avg = Math.round(value * (0.85 + rng() * 0.15));
    return {
      sectorId: s.id,
      sectorName: s.name,
      value,
      average: avg,
      projected: Math.round(value * (1 + rng() * 0.2)),
      previousValue: Math.round(value * (0.8 + rng() * 0.25)),
    };
  }).sort((a, b) => b.value - a.value);
}

// ─── Device distribution ────────────────────────────────
export function generateDeviceDistribution(filters: FilterState): DeviceDistributionItem[] {
  const devs = filteredDevices(filters);
  const byCategory = new Map<string, number>();
  const labelMap: Record<string, string> = {
    sensor: 'Sensores', actuator: 'Atuadores', meter: 'Medidores',
    controller: 'Controladores', gateway: 'Gateways',
  };
  for (const d of devs) {
    byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
  }
  return Array.from(byCategory.entries()).map(([cat, count]) => ({
    name: labelMap[cat] ?? cat,
    value: count,
    children: [
      { name: 'Online', value: devs.filter((d) => d.category === cat && d.status === 'online').length },
      { name: 'Alerta', value: devs.filter((d) => d.category === cat && d.status === 'alert').length },
      { name: 'Offline', value: devs.filter((d) => d.category === cat && d.status === 'offline').length },
      { name: 'Manutenção', value: devs.filter((d) => d.category === cat && d.status === 'maintenance').length },
    ].filter((c) => c.value > 0),
  }));
}

// ─── Heatmap ────────────────────────────────────────────
export function generateHeatmap(): HeatmapCell[] {
  const rng = createRng(liveSeed(60_000) + 30);
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const peak = hour >= 8 && hour <= 18 ? 1.5 : 0.6;
      const weekday = day < 5 ? 1.2 : 0.5;
      cells.push({ day, hour, value: Math.round((rng() * 100) * peak * weekday) });
    }
  }
  return cells;
}

// ─── Anomaly ranking ────────────────────────────────────
export function generateAnomalies(filters: FilterState): AnomalyRanking[] {
  const secs = filteredSectors(filters);
  const rng = createRng(liveSeed(20_000) + 40);
  const severities: SeverityLevel[] = ['critical', 'warning', 'emergency', 'info'];
  return secs
    .map((s) => ({
      entityId: s.id,
      entityName: s.name,
      count: Math.floor(rng() * 25),
      severity: severities[Math.floor(rng() * severities.length)],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ─── Financial ──────────────────────────────────────────
export function generateFinancial(filters: FilterState): FinancialEntry[] {
  const secs = filteredSectors(filters);
  const rng = createRng(liveSeed(30_000) + 50);
  return secs.map((s) => {
    const consumption = Math.round(800 + rng() * 6000);
    const cost = Math.round(consumption * (0.8 + rng() * 0.15));
    const budget = Math.round(cost * (1 + rng() * 0.4));
    return {
      roomName: s.name,
      sectorName: s.name,
      consumption,
      cost,
      budget,
      budgetUsed: Math.round((cost / budget) * 100),
    };
  }).sort((a, b) => b.cost - a.cost);
}

// ─── Sensor metrics ─────────────────────────────────────
export function generateSensorMetrics(filters: FilterState): SensorMetrics[] {
  const devs = filteredDevices({ ...filters, deviceCategory: 'sensor' });
  const rng = createRng(liveSeed(10_000) + 60);
  return devs.map((d) => ({
    deviceId: d.id,
    deviceName: d.name,
    sectorName: getSectorName(d.sectorId),
    status: d.status,
    latency: Math.round(5 + rng() * 195),
    errorRate: parseFloat((rng() * 5).toFixed(2)),
    jitter: parseFloat((rng() * 20).toFixed(1)),
    signalQuality: Math.round(40 + rng() * 60),
    uptime: parseFloat((90 + rng() * 10).toFixed(1)),
    stabilityScore: Math.round(50 + rng() * 50),
  }));
}

// ─── Equipment ──────────────────────────────────────────
export function generateEquipment(): Equipment[] {
  const rng = createRng(liveSeed(30_000) + 70);
  return equipmentList.map((eq, i) => {
    const health = Math.round(30 + rng() * 70);
    const status = health > 80 ? 'operational' as const
      : health > 50 ? 'degraded' as const
      : health > 25 ? 'at-risk' as const
      : 'down' as const;
    return {
      id: `eq-${i}`,
      name: eq.name,
      type: eq.type,
      sectorId: eq.sectorId,
      sectorName: getSectorName(eq.sectorId),
      healthScore: health,
      mtbf: Math.round(500 + rng() * 4500),
      failureProbability7d: parseFloat((rng() * 15).toFixed(1)),
      failureProbability30d: parseFloat((rng() * 35).toFixed(1)),
      failureProbability90d: parseFloat((rng() * 60).toFixed(1)),
      nextMaintenance: dayjs().add(Math.floor(1 + rng() * 60), 'day').toISOString(),
      lastMaintenance: dayjs().subtract(Math.floor(5 + rng() * 90), 'day').toISOString(),
      status,
      criticality: health < 30 ? 'critical' : health < 50 ? 'high' : health < 75 ? 'medium' : 'low',
    };
  });
}

// ─── Maintenance history ────────────────────────────────
export function generateMaintenanceHistory(): MaintenanceEvent[] {
  const rng = createRng(liveSeed(60_000) + 80);
  const types = ['preventive', 'corrective', 'predictive'] as const;
  const descriptions = [
    'Troca de filtros e lubrificação',
    'Substituição de rolamento',
    'Alinhamento e balanceamento',
    'Inspeção termográfica',
    'Calibração de sensores',
    'Limpeza de trocador de calor',
    'Troca de correias',
    'Reparo de vazamento',
  ];
  return equipmentList.flatMap((eq, i) => {
    const count = 1 + Math.floor(rng() * 4);
    return Array.from({ length: count }, (_, j) => ({
      id: `mnt-${i}-${j}`,
      equipmentId: `eq-${i}`,
      equipmentName: eq.name,
      type: types[Math.floor(rng() * types.length)],
      date: dayjs().subtract(Math.floor(1 + rng() * 180), 'day').toISOString(),
      description: descriptions[Math.floor(rng() * descriptions.length)],
      cost: Math.round(500 + rng() * 15000),
      durationHours: parseFloat((0.5 + rng() * 12).toFixed(1)),
    }));
  }).sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
}

// ─── Alert generation ───────────────────────────────────
let alertCounter = 0;
export function generateNewAlert(): Alert {
  const rng = createRng(Date.now() + alertCounter);
  const tpl = alertTemplates[Math.floor(rng() * alertTemplates.length)];
  const device = devices[Math.floor(rng() * devices.length)];
  alertCounter++;
  return {
    id: `alert-${Date.now()}-${alertCounter}`,
    severity: tpl.severity,
    title: tpl.title,
    message: tpl.message,
    deviceId: device.id,
    sectorId: device.sectorId,
    sectorName: getSectorName(device.sectorId),
    timestamp: new Date().toISOString(),
    acknowledged: false,
    silenced: false,
    category: tpl.category,
  };
}

export function generateInitialAlerts(count = 15): Alert[] {
  return Array.from({ length: count }, (_, i) => {
    const rng = createRng(42 + i);
    const tpl = alertTemplates[Math.floor(rng() * alertTemplates.length)];
    const device = devices[Math.floor(rng() * devices.length)];
    return {
      id: `alert-init-${i}`,
      severity: tpl.severity,
      title: tpl.title,
      message: tpl.message,
      deviceId: device.id,
      sectorId: device.sectorId,
      sectorName: getSectorName(device.sectorId),
      timestamp: dayjs().subtract(Math.floor(rng() * 120), 'minute').toISOString(),
      acknowledged: rng() > 0.7,
      silenced: false,
      category: tpl.category,
    };
  }).sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix());
}
