import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { DeviceDistributionItem } from '../types';
import { EChart } from '../components/EChart';
import { ChartContainer } from '../components/ChartContainer';
import { CHART_PALETTE } from '../utils/colors';

interface Props {
  data?: DeviceDistributionItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function DeviceDistribution({ data, isLoading, isError, refetch }: Props) {
  const option = useMemo((): EChartsOption => {
    if (!data?.length) return {};

    return {
      color: CHART_PALETTE,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { fontSize: 11 },
      },
      series: [
        {
          name: 'Categorias',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 'bold' },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.2)' },
          },
          data: data.map((d) => ({ name: d.name, value: d.value })),
        },
      ],
    };
  }, [data]);

  return (
    <ChartContainer title="Distribuição por Tipo de Dispositivo" isLoading={isLoading} isError={isError} onRetry={refetch}>
      <EChart option={option} style={{ height: 300 }} />
    </ChartContainer>
  );
}
