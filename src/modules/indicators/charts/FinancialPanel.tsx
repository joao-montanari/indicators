import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { FinancialEntry } from '../types';
import { EChart } from '../components/EChart';
import { ChartContainer } from '../components/ChartContainer';
import { fmtCurrency } from '../utils/format';

interface Props {
  data?: FinancialEntry[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function FinancialPanel({ data, isLoading, isError, refetch }: Props) {
  const option = useMemo((): EChartsOption => {
    if (!data?.length) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter(params: unknown) {
          const list = params as { name: string; value: number; seriesName: string; marker: string }[];
          if (!Array.isArray(list)) return '';
          const entry = data.find((d) => d.sectorName === list[0].name);
          return `<b>${list[0].name}</b><br/>${list.map((p) => `${p.marker} ${p.seriesName}: ${fmtCurrency(p.value)}`).join('<br/>')}${entry ? `<br/>Orçamento usado: <b>${entry.budgetUsed}%</b>` : ''}`;
        },
      },
      legend: { top: 0, textStyle: { fontSize: 10 } },
      grid: { left: 100, right: 30, top: 35, bottom: 30 },
      xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.sectorName),
        inverse: true,
        axisLabel: { fontSize: 10 },
      },
      series: [
        {
          name: 'Custo Realizado',
          type: 'bar',
          data: data.map((d) => d.cost),
          itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 18,
        },
        {
          name: 'Orçamento',
          type: 'bar',
          data: data.map((d) => d.budget),
          itemStyle: { color: '#e2e8f0', borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 18,
        },
      ],
    };
  }, [data]);

  // budget progress bars
  const progressBars = data?.slice(0, 5).map((entry) => {
    const pct = Math.min(entry.budgetUsed, 100);
    const color = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981';
    return (
      <div key={entry.sectorName} className="flex items-center gap-2 text-xs">
        <span className="w-24 truncate text-zinc-600 dark:text-zinc-400">{entry.sectorName}</span>
        <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="w-10 text-right font-medium" style={{ color }}>{entry.budgetUsed}%</span>
      </div>
    );
  });

  return (
    <div className="space-y-4">
      <ChartContainer title="Painel Financeiro — Custo vs Orçamento" isLoading={isLoading} isError={isError} onRetry={refetch}>
        <EChart option={option} style={{ height: 300 }} />
      </ChartContainer>
      {progressBars && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 space-y-2">
          <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Progresso Orçamentário</h4>
          {progressBars}
        </div>
      )}
    </div>
  );
}
