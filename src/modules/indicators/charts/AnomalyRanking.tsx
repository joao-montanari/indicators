import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { AnomalyRanking } from '../types';
import { EChart } from '../components/EChart';
import { ChartContainer } from '../components/ChartContainer';
import { SEVERITY_COLOR } from '../utils/colors';

interface Props {
  data?: AnomalyRanking[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function AnomalyRankingChart({ data, isLoading, isError, refetch }: Props) {
  const option = useMemo((): EChartsOption => {
    if (!data?.length) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: { left: 120, right: 30, top: 20, bottom: 30 },
      xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.entityName),
        inverse: true,
        axisLabel: { fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.count,
            itemStyle: { color: SEVERITY_COLOR[d.severity], borderRadius: [0, 4, 4, 0] },
          })),
          barMaxWidth: 20,
          label: {
            show: true,
            position: 'right',
            fontSize: 10,
            color: '#6b7280',
          },
        },
      ],
    };
  }, [data]);

  return (
    <ChartContainer title="Ranking de Anomalias (Top 10)" isLoading={isLoading} isError={isError} onRetry={refetch}>
      <EChart option={option} style={{ height: 350 }} />
    </ChartContainer>
  );
}
