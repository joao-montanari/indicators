import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import {
  Bell, Check, VolumeX, AlertTriangle, AlertOctagon, Info, Siren,
} from 'lucide-react';
import { useAlertStore } from '../stores/alertStore';
import { SEVERITY_COLOR, SEVERITY_BG, SEVERITY_LABEL } from '../utils/colors';
import type { SeverityLevel } from '../types';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const SEVERITY_ICON: Record<SeverityLevel, React.ReactNode> = {
  info: <Info size={14} />,
  warning: <AlertTriangle size={14} />,
  critical: <AlertOctagon size={14} />,
  emergency: <Siren size={14} />,
};

export function AlertFeed() {
  const { alerts, acknowledge, silence } = useAlertStore();
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filtered = useMemo(() => {
    let list = alerts;
    if (severityFilter !== 'all') list = list.filter((a) => a.severity === severityFilter);
    if (!showAcknowledged) list = list.filter((a) => !a.acknowledged);
    return list.slice(0, 50);
  }, [alerts, severityFilter, showAcknowledged]);

  const severityOrder: SeverityLevel[] = ['emergency', 'critical', 'warning', 'info'];
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: alerts.filter((a) => !a.acknowledged).length };
    for (const s of severityOrder) c[s] = alerts.filter((a) => a.severity === s && !a.acknowledged).length;
    return c;
  }, [alerts]);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Alertas em Tempo Real</h3>
            <span className="ml-1 text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 tabular-nums animate-pulse">
              {counts['all']}
            </span>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
            />
            Resolvidos
          </label>
        </div>

        {/* Severity filters */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${severityFilter === 'all' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
          >
            Todos ({counts['all']})
          </button>
          {severityOrder.map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
              style={{
                background: severityFilter === s ? SEVERITY_COLOR[s] : SEVERITY_BG[s],
                color: severityFilter === s ? '#fff' : SEVERITY_COLOR[s],
              }}
            >
              {SEVERITY_LABEL[s]} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-700/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Nenhum alerta encontrado</div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`px-4 py-3 flex gap-3 items-start transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-750 ${
                alert.acknowledged ? 'opacity-50' : ''
              } ${alert.severity === 'emergency' ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}
            >
              {/* Icon */}
              <span
                className="mt-0.5 p-1.5 rounded-lg shrink-0"
                style={{ background: SEVERITY_BG[alert.severity], color: SEVERITY_COLOR[alert.severity] }}
              >
                {SEVERITY_ICON[alert.severity]}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{alert.title}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0"
                    style={{ background: SEVERITY_BG[alert.severity], color: SEVERITY_COLOR[alert.severity] }}
                  >
                    {SEVERITY_LABEL[alert.severity]}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                  <span>{alert.sectorName}</span>
                  <span>•</span>
                  <span>{dayjs(alert.timestamp).fromNow()}</span>
                </div>
              </div>

              {/* Actions */}
              {!alert.acknowledged && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600"
                    title="Reconhecer"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => silence(alert.id)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
                    title="Silenciar"
                  >
                    <VolumeX size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
