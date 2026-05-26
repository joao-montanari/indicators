import type { SeverityLevel, DeviceStatus, EquipmentStatus, Criticality } from '../types';

export const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  info: '#6366f1',
  warning: '#f59e0b',
  critical: '#ef4444',
  emergency: '#dc2626',
};

export const SEVERITY_BG: Record<SeverityLevel, string> = {
  info: 'rgba(99,102,241,.12)',
  warning: 'rgba(245,158,11,.12)',
  critical: 'rgba(239,68,68,.12)',
  emergency: 'rgba(220,38,38,.15)',
};

export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  info: 'Informativo',
  warning: 'Atenção',
  critical: 'Crítico',
  emergency: 'Emergência',
};

export const STATUS_COLOR: Record<DeviceStatus, string> = {
  online: '#10b981',
  offline: '#6b7280',
  alert: '#f59e0b',
  maintenance: '#8b5cf6',
};

export const EQ_STATUS_COLOR: Record<EquipmentStatus, string> = {
  operational: '#10b981',
  degraded: '#f59e0b',
  'at-risk': '#ef4444',
  down: '#6b7280',
};

export const CRIT_COLOR: Record<Criticality, string> = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

export const CHART_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];
