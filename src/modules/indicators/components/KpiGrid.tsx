import { useMemo } from 'react';
import {
  Zap, DollarSign, AlertTriangle, Wifi, Settings, Heart,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { fmtCompact, fmtCurrency, fmtPercent } from '../utils/format';
import type { KpiData, SeverityLevel } from '../types';
import { SEVERITY_COLOR } from '../utils/colors';
import { CardSkeleton } from './Skeleton';

/* ── mini sparkline as inline SVG ───────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const h = 32;
  const w = 80;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="mt-1" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── trend arrow ────────────────────────────────────────── */
function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct > 0.5;
  const isDown = pct < -0.5;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const color = isUp ? 'text-emerald-500' : isDown ? 'text-red-500' : 'text-zinc-400';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={14} />
      {fmtPercent(pct)}
    </span>
  );
}

/* ── single KPI card ────────────────────────────────────── */
interface CardProps {
  title: string;
  value: string;
  current: number;
  previous: number;
  icon: React.ReactNode;
  sparkline?: number[];
  sparkColor?: string;
  tooltip: string;
  accent?: string;
  extra?: React.ReactNode;
}

function KpiCardInner({ title, value, current, previous, icon, sparkline, sparkColor = '#3b82f6', tooltip, accent, extra }: CardProps) {
  return (
    <div
      className="group relative rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500"
      tabIndex={0}
      role="region"
      aria-label={title}
    >
      {/* tooltip */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-9 z-50 hidden group-hover:block whitespace-nowrap rounded bg-zinc-900 text-white text-xs px-2.5 py-1 shadow">
        {tooltip}
      </div>

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</span>
        <span className="p-1.5 rounded-lg" style={{ background: accent ? `${accent}18` : 'rgba(59,130,246,.1)' }}>
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums transition-all duration-500">
        {value}
      </p>

      <div className="mt-1 flex items-center gap-3">
        <TrendBadge current={current} previous={previous} />
        {sparkline && <Sparkline data={sparkline} color={sparkColor} />}
      </div>

      {extra && <div className="mt-2">{extra}</div>}
    </div>
  );
}

/* ── KPI Grid ───────────────────────────────────────────── */
export function KpiGrid({ data, isLoading }: { data?: KpiData; isLoading: boolean }) {
  const alertTotal = useMemo(() => {
    if (!data) return 0;
    return Object.values(data.activeAlerts).reduce((a, b) => a + b, 0);
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const severityKeys: SeverityLevel[] = ['emergency', 'critical', 'warning', 'info'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCardInner
        title="Consumo Total"
        value={`${fmtCompact(data.totalConsumption)} kWh`}
        current={data.totalConsumption}
        previous={data.previousConsumption}
        icon={<Zap size={18} className="text-blue-500" />}
        sparkline={data.consumptionSparkline}
        sparkColor="#3b82f6"
        tooltip="Consumo energético acumulado no período selecionado"
        accent="#3b82f6"
      />
      <KpiCardInner
        title="Custo Estimado"
        value={fmtCurrency(data.estimatedCost)}
        current={data.estimatedCost}
        previous={data.previousCost}
        icon={<DollarSign size={18} className="text-emerald-500" />}
        sparkline={data.costSparkline}
        sparkColor="#10b981"
        tooltip="Custo estimado com base na tarifa média vigente"
        accent="#10b981"
      />
      <KpiCardInner
        title="Alertas Ativos"
        value={String(alertTotal)}
        current={alertTotal}
        previous={alertTotal + 2}
        icon={<AlertTriangle size={18} className="text-amber-500" />}
        tooltip="Total de alertas não resolvidos por severidade"
        accent="#f59e0b"
        extra={
          <div className="flex gap-1.5 flex-wrap">
            {severityKeys.map((sev) =>
              data.activeAlerts[sev] > 0 ? (
                <span
                  key={sev}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${SEVERITY_COLOR[sev]}20`, color: SEVERITY_COLOR[sev] }}
                >
                  {data.activeAlerts[sev]} {sev}
                </span>
              ) : null,
            )}
          </div>
        }
      />
      <KpiCardInner
        title="Sensores Online"
        value={`${Math.round((data.sensorsOnline / data.sensorsTotal) * 100)}%`}
        current={data.sensorsOnline}
        previous={data.sensorsTotal}
        icon={<Wifi size={18} className="text-cyan-500" />}
        tooltip={`${data.sensorsOnline} de ${data.sensorsTotal} sensores respondendo`}
        accent="#06b6d4"
      />
      <KpiCardInner
        title="Equip. Operando"
        value={`${data.equipmentsOperating}/${data.equipmentsTotal}`}
        current={data.equipmentsOperating}
        previous={data.equipmentsTotal}
        icon={<Settings size={18} className="text-violet-500" />}
        tooltip="Equipamentos em operação vs capacidade instalada"
        accent="#8b5cf6"
      />
      <KpiCardInner
        title="Saúde Global"
        value={`${data.healthScore}`}
        current={data.healthScore}
        previous={data.previousHealthScore}
        icon={<Heart size={18} className="text-rose-500" />}
        sparkline={data.healthSparkline}
        sparkColor="#f43f5e"
        tooltip="Score composto de saúde da planta (0-100)"
        accent="#f43f5e"
        extra={
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${data.healthScore}%`,
                background: data.healthScore > 70 ? '#10b981' : data.healthScore > 40 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        }
      />
    </div>
  );
}
