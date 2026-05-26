import { useState, useCallback, useRef } from 'react';
import { Maximize2, Minimize2, Download, X } from 'lucide-react';
import type { EChartsType } from 'echarts';
import { ChartSkeleton } from './Skeleton';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  chartRef?: React.RefObject<EChartsType | null>;
}

export function ChartContainer({ title, children, isLoading, isError, onRetry, chartRef }: ChartContainerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => setFullscreen((p) => !p), []);

  const handleExport = useCallback(() => {
    if (!chartRef?.current) return;
    const url = chartRef.current.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.png`;
    a.click();
  }, [chartRef, title]);

  if (isLoading) return <ChartSkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 text-sm mb-2">Erro ao carregar dados</p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs font-medium text-red-700 dark:text-red-300 underline">
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  const container = (
    <div
      ref={wrapperRef}
      className={
        fullscreen
          ? 'fixed inset-0 z-[9999] bg-white dark:bg-zinc-900 p-6 flex flex-col overflow-auto'
          : 'rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5'
      }
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</h3>
        <div className="flex gap-1">
          {chartRef && (
            <button
              onClick={handleExport}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
              aria-label="Exportar PNG"
              title="Exportar PNG"
            >
              <Download size={15} />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
            aria-label={fullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
            title={fullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          {fullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
              aria-label="Fechar"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <div className={fullscreen ? 'flex-1 min-h-0' : ''}>
        {children}
      </div>
    </div>
  );

  return container;
}
