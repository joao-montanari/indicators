import { useRef, useEffect, useCallback } from 'react';
import * as echarts from 'echarts';

interface EChartProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  theme?: 'light' | 'dark';
}

export function EChart({ option, style, className, theme }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  const initChart = useCallback(() => {
    if (!containerRef.current) return;
    chartRef.current?.dispose();
    chartRef.current = echarts.init(containerRef.current, theme, { renderer: 'canvas' });
    chartRef.current.setOption(option, { notMerge: true });
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initChart();

    const ro = new ResizeObserver(() => chartRef.current?.resize());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [initChart]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption(option, { notMerge: true });
  }, [option]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: 350, ...style }}
    />
  );
}
