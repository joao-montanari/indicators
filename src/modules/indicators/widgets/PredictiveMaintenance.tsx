import dayjs from 'dayjs';
import {
  Shield, Calendar, Clock, Wrench,
} from 'lucide-react';
import type { Equipment, MaintenanceEvent } from '../types';
import { EQ_STATUS_COLOR, CRIT_COLOR } from '../utils/colors';
import { fmtCurrency, fmtNumber } from '../utils/format';
import { ChartSkeleton } from '../components/Skeleton';

interface Props {
  equipment?: Equipment[];
  history?: MaintenanceEvent[];
  isLoading: boolean;
}

function HealthBar({ score }: { score: number }) {
  const color = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

function ProbabilityBadge({ value, label }: { value: number; label: string }) {
  const color = value > 30 ? '#ef4444' : value > 15 ? '#f59e0b' : '#10b981';
  return (
    <div className="text-center">
      <div className="text-[10px] text-zinc-400 mb-0.5">{label}</div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}%</span>
    </div>
  );
}

export function PredictiveMaintenance({ equipment, history, isLoading }: Props) {
  if (isLoading || !equipment) return <ChartSkeleton />;

  const atRisk = equipment
    .filter((e) => e.status !== 'operational')
    .sort((a, b) => a.healthScore - b.healthScore);

  const upcoming = equipment
    .filter((e) => dayjs(e.nextMaintenance).diff(dayjs(), 'day') < 30)
    .sort((a, b) => dayjs(a.nextMaintenance).unix() - dayjs(b.nextMaintenance).unix())
    .slice(0, 6);

  const recentHistory = history?.slice(0, 8) ?? [];

  return (
    <div className="space-y-4">
      {/* Equipment at risk */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Equipamentos em Risco</h3>
          <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full px-1.5 py-0.5">
            {atRisk.length}
          </span>
        </div>

        {atRisk.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4 text-center">Todos os equipamentos operacionais</p>
        ) : (
          <div className="space-y-3">
            {atRisk.slice(0, 6).map((eq) => (
              <div key={eq.id} className="border border-zinc-100 dark:border-zinc-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{eq.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${EQ_STATUS_COLOR[eq.status]}18`, color: EQ_STATUS_COLOR[eq.status] }}
                      >
                        {eq.status}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${CRIT_COLOR[eq.criticality]}18`, color: CRIT_COLOR[eq.criticality] }}
                      >
                        {eq.criticality}
                      </span>
                      <span className="text-[10px] text-zinc-400">{eq.sectorName}</span>
                    </div>
                  </div>
                  <HealthBar score={eq.healthScore} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <ProbabilityBadge value={eq.failureProbability7d} label="7d" />
                    <ProbabilityBadge value={eq.failureProbability30d} label="30d" />
                    <ProbabilityBadge value={eq.failureProbability90d} label="90d" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400">MTBF</div>
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{fmtNumber(eq.mtbf)}h</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming maintenance */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Próximas Manutenções</h3>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-3">Nenhuma manutenção nos próximos 30 dias</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((eq) => {
              const daysUntil = dayjs(eq.nextMaintenance).diff(dayjs(), 'day');
              const urgent = daysUntil < 7;
              return (
                <div key={eq.id} className="flex items-center gap-3 text-xs py-1">
                  <Clock size={12} className={urgent ? 'text-red-500' : 'text-zinc-400'} />
                  <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">{eq.name}</span>
                  <span className={`font-medium tabular-nums ${urgent ? 'text-red-500' : 'text-zinc-500'}`}>
                    {daysUntil < 1 ? 'Hoje' : `${daysUntil}d`}
                  </span>
                  <span className="text-zinc-400">{dayjs(eq.nextMaintenance).format('DD/MM')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench size={16} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Histórico de Intervenções</h3>
          </div>
          <div className="space-y-2">
            {recentHistory.map((evt) => (
              <div key={evt.id} className="flex items-center gap-3 text-xs py-1 border-b border-zinc-100 dark:border-zinc-700 last:border-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  evt.type === 'corrective' ? 'bg-red-100 dark:bg-red-950 text-red-600' :
                  evt.type === 'predictive' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                  'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                }`}>
                  {evt.type === 'corrective' ? 'Corr' : evt.type === 'predictive' ? 'Pred' : 'Prev'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-zinc-700 dark:text-zinc-300 truncate block">{evt.equipmentName}</span>
                  <span className="text-[10px] text-zinc-400 truncate block">{evt.description}</span>
                </div>
                <span className="text-zinc-400 shrink-0">{dayjs(evt.date).format('DD/MM/YY')}</span>
                <span className="text-zinc-500 font-medium shrink-0">{fmtCurrency(evt.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
