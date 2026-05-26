import { Wifi, WifiOff, AlertTriangle, Wrench, Activity } from 'lucide-react';
import type { SensorMetrics } from '../types';
import { STATUS_COLOR } from '../utils/colors';
import { ChartSkeleton } from '../components/Skeleton';
import { EChart } from '../components/EChart';
import type { EChartsOption } from 'echarts';

interface Props {
  data?: SensorMetrics[];
  isLoading: boolean;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  online: <Wifi size={12} />,
  offline: <WifiOff size={12} />,
  alert: <AlertTriangle size={12} />,
  maintenance: <Wrench size={12} />,
};

function StabilityBar({ score }: { score: number }) {
  const color = score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

export function SensorHealth({ data, isLoading }: Props) {
  if (isLoading || !data) return <ChartSkeleton />;

  const online = data.filter((d) => d.status === 'online').length;
  const total = data.length;
  const pct = total ? Math.round((online / total) * 100) : 0;

  const avgLatency = data.length ? Math.round(data.reduce((a, b) => a + b.latency, 0) / data.length) : 0;
  const avgErrorRate = data.length ? (data.reduce((a, b) => a + b.errorRate, 0) / data.length).toFixed(2) : '0';
  const avgSignal = data.length ? Math.round(data.reduce((a, b) => a + b.signalQuality, 0) / data.length) : 0;

  const statusCounts = {
    online: data.filter((d) => d.status === 'online').length,
    alert: data.filter((d) => d.status === 'alert').length,
    offline: data.filter((d) => d.status === 'offline').length,
    maintenance: data.filter((d) => d.status === 'maintenance').length,
  };

  const gaugeOption: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 100,
        pointer: { show: false },
        progress: {
          show: true,
          width: 14,
          roundCap: true,
          itemStyle: { color: pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444' },
        },
        axisLine: { lineStyle: { width: 14, color: [[1, '#e5e7eb']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          fontWeight: 'bold',
          formatter: '{value}%',
          offsetCenter: [0, '10%'],
          color: 'inherit',
        },
        title: { fontSize: 11, offsetCenter: [0, '40%'], color: '#9ca3af' },
        data: [{ value: pct, name: 'Online' }],
      },
    ],
  };

  // unstable sensors (low stability or offline/alert)
  const unstable = data
    .filter((d) => d.stabilityScore < 60 || d.status === 'offline' || d.status === 'alert')
    .sort((a, b) => a.stabilityScore - b.stabilityScore)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-cyan-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Observabilidade de Sensores</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Gauge */}
          <div>
            <EChart option={gaugeOption} style={{ height: 180 }} />
          </div>

          {/* Metrics */}
          <div className="space-y-3 py-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Latência Média</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{avgLatency} ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Taxa de Erro</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{avgErrorRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Qualidade do Sinal</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{avgSignal}%</span>
            </div>
            <div className="flex gap-2 mt-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${STATUS_COLOR[status as keyof typeof STATUS_COLOR]}18`, color: STATUS_COLOR[status as keyof typeof STATUS_COLOR] }}
                >
                  {STATUS_ICON[status]} {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unstable sensors table */}
      {unstable.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
          <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-3">
            Sensores Instáveis / Offline
          </h4>
          <div className="space-y-2">
            {unstable.map((s) => (
              <div key={s.deviceId} className="flex items-center gap-3 text-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: STATUS_COLOR[s.status] }}
                />
                <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">{s.deviceName}</span>
                <span className="text-zinc-400 w-16 truncate">{s.sectorName}</span>
                <StabilityBar score={s.stabilityScore} />
                <span className="w-8 text-right font-medium text-zinc-500">{s.stabilityScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
