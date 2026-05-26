import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { EChartsOption } from 'echarts';
import type { TimeSeriesPoint } from '../types';
import { EChart } from '../components/EChart';
import { ChartContainer } from '../components/ChartContainer';
import { useFilterStore } from '../stores/filterStore';

interface Props {
  current?: TimeSeriesPoint[];
  previous?: TimeSeriesPoint[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function TemporalTrend({ current, previous, isLoading, isError, refetch }: Props) {
  const comparePrevious = useFilterStore((s) => s.comparePrevious);

  const option = useMemo((): EChartsOption => {
    if (!current?.length) return {};

    const series: EChartsOption['series'] = [
      {
        name: 'Período Atual',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.15 },
        data: current.map((p) => [p.timestamp, p.value]),
        emphasis: { focus: 'series' },
        color: '#3b82f6',
      },
    ];

    if (comparePrevious && previous?.length) {
      (series as unknown[]).push({
        name: 'Período Anterior',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, type: 'dashed' },
        data: previous.map((p, i) => [current[i]?.timestamp ?? p.timestamp, p.value]),
        color: '#94a3b8',
        emphasis: { focus: 'series' },
      });
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter(params: unknown) {
          const list = params as { seriesName: string; value: [string, number]; marker: string }[];
          if (!Array.isArray(list)) return '';
          const time = dayjs(list[0].value[0]).format('DD/MM HH:mm');
          const header = `<b>${time}</b><br/>`;
          return header + list.map((p) => `${p.marker} ${p.seriesName}: ${p.value[1].toLocaleString('pt-BR')} kWh`).join('<br/>');
        },
      },
      grid: { left: 60, right: 30, top: 30, bottom: 60 },
      xAxis: {
        type: 'time',
        axisLabel: { fontSize: 10, formatter: '{dd}/{MM} {HH}:{mm}' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } },
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', height: 20, bottom: 8, borderColor: 'transparent', fillerColor: 'rgba(59,130,246,.15)' },
      ],
      series,
    };
  }, [current, previous, comparePrevious]);

  return (
    <ChartContainer title="Tendência Temporal" isLoading={isLoading} isError={isError} onRetry={refetch}>
      <EChart option={option} style={{ height: 350 }} />
    </ChartContainer>
  );
}
