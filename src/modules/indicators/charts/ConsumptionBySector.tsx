import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { SectorConsumption } from '../types';
import { EChart } from '../components/EChart';
import { ChartContainer } from '../components/ChartContainer';
import { useFilterStore } from '../stores/filterStore';
import { CHART_PALETTE } from '../utils/colors';

interface Props {
  data?: SectorConsumption[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function ConsumptionBySector({ data, isLoading, isError, refetch }: Props) {
  const comparePrevious = useFilterStore((s) => s.comparePrevious);

  const option = useMemo((): EChartsOption => {
    if (!data?.length) return {};
    const names = data.map((d) => d.sectorName);
    const series: EChartsOption['series'] = [
      {
        name: 'Consumo Atual',
        type: 'bar',
        data: data.map((d) => d.value),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 24,
        colorBy: 'data',
      },
    ];
    if (comparePrevious) {
      (series as unknown[]).push({
        name: 'Período Anterior',
        type: 'bar',
        data: data.map((d) => d.previousValue),
        itemStyle: { borderRadius: [0, 4, 4, 0], opacity: 0.4 },
        barMaxWidth: 24,
      });
    }
    (series as unknown[]).push({
      name: 'Média',
      type: 'scatter',
      symbol: 'diamond',
      symbolSize: 8,
      data: data.map((d) => d.average),
      itemStyle: { color: '#ef4444' },
    });

    return {
      color: CHART_PALETTE,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter(params: unknown) {
          const list = params as { seriesName: string; value: number; name: string; marker: string }[];
          if (!Array.isArray(list)) return '';
          const header = `<b>${list[0].name}</b><br/>`;
          return header + list.map((p) => `${p.marker} ${p.seriesName}: ${p.value.toLocaleString('pt-BR')} kWh`).join('<br/>');
        },
      },
      grid: { left: 120, right: 30, top: 20, bottom: 30 },
      xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      yAxis: { type: 'category', data: names, inverse: true, axisLabel: { fontSize: 10 } },
      dataZoom: [{ type: 'inside' }],
      series,
    };
  }, [data, comparePrevious]);

  return (
    <ChartContainer title="Consumo por Setor" isLoading={isLoading} isError={isError} onRetry={refetch}>
      <EChart option={option} style={{ height: 350 }} />
    </ChartContainer>
  );
}
