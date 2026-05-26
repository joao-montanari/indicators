// ─── Temporal ───────────────────────────────────────────
export type TimePreset = '24h' | '7d' | '30d' | '90d' | 'YTD' | 'custom';

export interface TimeRange {
  preset: TimePreset;
  start: string;
  end: string;
}

// ─── Hierarchy ──────────────────────────────────────────
export interface Site {
  id: string;
  name: string;
}
export interface Building {
  id: string;
  siteId: string;
  name: string;
}
export interface Floor {
  id: string;
  buildingId: string;
  name: string;
}
export interface Sector {
  id: string;
  floorId: string;
  name: string;
}
export interface Room {
  id: string;
  sectorId: string;
  name: string;
}

// ─── Devices ────────────────────────────────────────────
export type DeviceCategory = 'sensor' | 'actuator' | 'meter' | 'controller' | 'gateway';
export type DeviceStatus = 'online' | 'offline' | 'alert' | 'maintenance';
export type SeverityLevel = 'info' | 'warning' | 'critical' | 'emergency';

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  status: DeviceStatus;
  sectorId: string;
  roomId: string;
  lastSeen: string;
}

export interface SensorMetrics {
  deviceId: string;
  deviceName: string;
  sectorName: string;
  status: DeviceStatus;
  latency: number;
  errorRate: number;
  jitter: number;
  signalQuality: number;
  uptime: number;
  stabilityScore: number;
}

// ─── Equipment / Maintenance ────────────────────────────
export type EquipmentStatus = 'operational' | 'degraded' | 'at-risk' | 'down';
export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  sectorId: string;
  sectorName: string;
  healthScore: number;
  mtbf: number;
  failureProbability7d: number;
  failureProbability30d: number;
  failureProbability90d: number;
  nextMaintenance: string;
  lastMaintenance: string;
  status: EquipmentStatus;
  criticality: Criticality;
}

export interface MaintenanceEvent {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'predictive';
  date: string;
  description: string;
  cost: number;
  durationHours: number;
}

// ─── Alert ──────────────────────────────────────────────
export interface Alert {
  id: string;
  severity: SeverityLevel;
  title: string;
  message: string;
  deviceId: string;
  sectorId: string;
  sectorName: string;
  timestamp: string;
  acknowledged: boolean;
  silenced: boolean;
  groupId?: string;
  category: string;
}

// ─── KPI ────────────────────────────────────────────────
export interface KpiData {
  totalConsumption: number;
  previousConsumption: number;
  estimatedCost: number;
  previousCost: number;
  activeAlerts: Record<SeverityLevel, number>;
  sensorsOnline: number;
  sensorsTotal: number;
  equipmentsOperating: number;
  equipmentsTotal: number;
  healthScore: number;
  previousHealthScore: number;
  consumptionSparkline: number[];
  costSparkline: number[];
  healthSparkline: number[];
}

// ─── Charts ─────────────────────────────────────────────
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface SectorConsumption {
  sectorId: string;
  sectorName: string;
  value: number;
  average: number;
  projected: number;
  previousValue: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

export interface AnomalyRanking {
  entityId: string;
  entityName: string;
  count: number;
  severity: SeverityLevel;
}

export interface FinancialEntry {
  roomName: string;
  sectorName: string;
  consumption: number;
  cost: number;
  budget: number;
  budgetUsed: number;
}

export interface DeviceDistributionItem {
  name: string;
  value: number;
  children?: { name: string; value: number }[];
}

// ─── Filter State ───────────────────────────────────────
export interface FilterState {
  timeRange: TimeRange;
  comparePrevious: boolean;
  siteId: string | null;
  buildingId: string | null;
  floorId: string | null;
  sectorId: string | null;
  roomId: string | null;
  deviceCategory: DeviceCategory | null;
  deviceStatus: DeviceStatus | null;
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

export interface WidgetPreferences {
  showAlerts: boolean;
  showSensorHealth: boolean;
  showMaintenance: boolean;
  showFinancial: boolean;
  showHeatmap: boolean;
  showAnomalies: boolean;
}

// ─── Chart Data Bundle ──────────────────────────────────
export interface ChartDataBundle {
  sectorConsumption: SectorConsumption[];
  temporalTrend: TimeSeriesPoint[];
  previousTrend: TimeSeriesPoint[];
  deviceDistribution: DeviceDistributionItem[];
  heatmap: HeatmapCell[];
  anomalies: AnomalyRanking[];
  financial: FinancialEntry[];
}
