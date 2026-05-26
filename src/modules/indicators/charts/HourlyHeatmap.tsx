import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { HeatmapCell } from '../types';
import { EChart } from '../components/EChart';
import { ChartContainer } from '../components/ChartContainer';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);

interface Props {
  data?: HeatmapCell[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function HourlyHeatmap({ data, isLoading, isError, refetch }: Props) {
  const option = useMemo((): EChartsOption => {
    if (!data?.length) return {};

    const max = Math.max(...data.map((d) => d.value));

    return {
      tooltip: {
        position: 'top',
        formatter(params: unknown) {
          const p = params as { value: [number, number, number] };
          return `${DAYS[p.value[1]]} ${HOURS[p.value[0]]}<br/><b>${p.value[2]} kWh</b>`;
        },
      },
      grid: { left: 50, right: 30, top: 10, bottom: 50 },
      xAxis: {
        type: 'category',
        data: HOURS,
        splitArea: { show: true },
        axisLabel: { fontSize: 9 },
      },
      yAxis: {
        type: 'category',
        data: DAYS,
        splitArea: { show: true },
        axisLabel: { fontSize: 10 },
      },
      visualMap: {
        min: 0,
        max,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        itemWidth: 12,
        itemHeight: 120,
        textStyle: { fontSize: 10 },
        inRange: { color: ['#eef2ff', '#818cf8', '#4338ca'] },
      },
      series: [
        {
          type: 'heatmap',
          data: data.map((d) => [d.hour, d.day, d.value]),
          emphasis: {
            itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,.3)' },
          },
        },
      ],
    };
  }, [data]);

  return (
    <ChartContainer title="Heatmap Horário (Dia × Hora)" isLoading={isLoading} isError={isError} onRetry={refetch}>
      <EChart option={option} style={{ height: 300 }} />
    </ChartContainer>
  );
}
