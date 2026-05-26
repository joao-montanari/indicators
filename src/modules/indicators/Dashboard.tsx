import { useState } from 'react';
import {
  BarChart3, Eye, EyeOff, Sun, Moon, LayoutGrid,
} from 'lucide-react';
import { FilterBar } from './filters/FilterBar';
import { KpiGrid } from './components/KpiGrid';
import { ConsumptionBySector } from './charts/ConsumptionBySector';
import { TemporalTrend } from './charts/TemporalTrend';
import { DeviceDistribution } from './charts/DeviceDistribution';
import { HourlyHeatmap } from './charts/HourlyHeatmap';
import { AnomalyRankingChart } from './charts/AnomalyRanking';
import { FinancialPanel } from './charts/FinancialPanel';
import { AlertFeed } from './widgets/AlertFeed';
import { SensorHealth } from './widgets/SensorHealth';
import { PredictiveMaintenance } from './widgets/PredictiveMaintenance';
import {
  useKpis, useTrend, useSectorConsumption,
  useDeviceDistribution, useHeatmap, useAnomalies,
  useFinancial, useSensorMetrics, useEquipment,
  useMaintenanceHistory,
} from './hooks/useIndicatorQueries';
import { useSimulator } from './hooks/useSimulator';
import { usePreferencesStore } from './stores/preferencesStore';

export function Dashboard() {
  // Start live simulator
  useSimulator();

  // Queries
  const kpis = useKpis();
  const trend = useTrend();
  const sectorConsumption = useSectorConsumption();
  const deviceDist = useDeviceDistribution();
  const heatmap = useHeatmap();
  const anomalies = useAnomalies();
  const financial = useFinancial();
  const sensors = useSensorMetrics();
  const equipment = useEquipment();
  const maintenance = useMaintenanceHistory();

  // Preferences
  const { prefs, toggleWidget } = usePreferencesStore();
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const toggleTheme = () => {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d);
      return !d;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={22} className="text-blue-500" />
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                Painel de Indicadores
              </h1>
              <p className="text-[11px] text-zinc-400">Dashboard Industrial Inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Widget toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                title="Configurar widgets"
              >
                <LayoutGrid size={16} />
              </button>
              {showSettings && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Widgets visíveis</h4>
                  {(Object.entries(prefs) as [keyof typeof prefs, boolean][]).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      showAlerts: 'Alertas',
                      showSensorHealth: 'Saúde Sensores',
                      showMaintenance: 'Manutenção',
                      showFinancial: 'Financeiro',
                      showHeatmap: 'Heatmap Horário',
                      showAnomalies: 'Anomalias',
                    };
                    return (
                      <label key={key} className="flex items-center gap-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => toggleWidget(key)}
                          className="rounded border-zinc-300"
                        />
                        <span className="flex items-center gap-1.5">
                          {value ? <Eye size={12} /> : <EyeOff size={12} />}
                          {labels[key]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              title="Alternar tema"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
        {/* Filters */}
        <FilterBar />

        {/* KPI Cards */}
        <KpiGrid data={kpis.data} isLoading={kpis.isLoading} />

        {/* Charts Row 1: Trend + Sector Consumption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TemporalTrend
            current={trend.data?.current}
            previous={trend.data?.previous}
            isLoading={trend.isLoading}
            isError={trend.isError}
            refetch={trend.refetch}
          />
          <ConsumptionBySector
            data={sectorConsumption.data}
            isLoading={sectorConsumption.isLoading}
            isError={sectorConsumption.isError}
            refetch={sectorConsumption.refetch}
          />
        </div>

        {/* Charts Row 2: Device Distribution + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DeviceDistribution
            data={deviceDist.data}
            isLoading={deviceDist.isLoading}
            isError={deviceDist.isError}
            refetch={deviceDist.refetch}
          />
          {prefs.showHeatmap && (
            <HourlyHeatmap
              data={heatmap.data}
              isLoading={heatmap.isLoading}
              isError={heatmap.isError}
              refetch={heatmap.refetch}
            />
          )}
        </div>

        {/* Alerts + Sensor Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {prefs.showAlerts && (
            <div className="lg:col-span-1">
              <AlertFeed />
            </div>
          )}
          {prefs.showSensorHealth && (
            <div className="lg:col-span-2">
              <SensorHealth data={sensors.data} isLoading={sensors.isLoading} />
            </div>
          )}
        </div>

        {/* Anomalies + Financial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {prefs.showAnomalies && (
            <AnomalyRankingChart
              data={anomalies.data}
              isLoading={anomalies.isLoading}
              isError={anomalies.isError}
              refetch={anomalies.refetch}
            />
          )}
          {prefs.showFinancial && (
            <FinancialPanel
              data={financial.data}
              isLoading={financial.isLoading}
              isError={financial.isError}
              refetch={financial.refetch}
            />
          )}
        </div>

        {/* Predictive Maintenance */}
        {prefs.showMaintenance && (
          <div>
            <PredictiveMaintenance
              equipment={equipment.data}
              history={maintenance.data}
              isLoading={equipment.isLoading}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-[10px] text-zinc-400 py-4 border-t border-zinc-200 dark:border-zinc-700">
          Dados simulados para demonstração • Atualização automática ativa
        </footer>
      </main>
    </div>
  );
}
