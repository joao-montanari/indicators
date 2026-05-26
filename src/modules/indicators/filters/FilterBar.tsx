import { useState } from 'react';
import {
  Clock, MapPin, Cpu, Radio, Save, RotateCcw, ChevronDown, X, Bookmark,
} from 'lucide-react';
import { useFilterStore } from '../stores/filterStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import type { TimePreset, DeviceCategory, DeviceStatus } from '../types';
import { sites, buildings, floors, sectors, getBuildingsForSite, getFloorsForBuilding, getSectorsForFloor } from '../mocks/data';

const TIME_PRESETS: { value: Exclude<TimePreset, 'custom'>; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'YTD', label: 'YTD' },
];

const CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'sensor', label: 'Sensores' },
  { value: 'actuator', label: 'Atuadores' },
  { value: 'meter', label: 'Medidores' },
  { value: 'controller', label: 'Controladores' },
  { value: 'gateway', label: 'Gateways' },
];

const STATUSES: { value: DeviceStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Online', color: '#10b981' },
  { value: 'offline', label: 'Offline', color: '#6b7280' },
  { value: 'alert', label: 'Alerta', color: '#f59e0b' },
  { value: 'maintenance', label: 'Manutenção', color: '#8b5cf6' },
];

function Select({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex items-center">
      {icon && <span className="absolute left-2 text-zinc-400 pointer-events-none">{icon}</span>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`appearance-none rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 py-1.5 pr-7 ${icon ? 'pl-7' : 'pl-2.5'} cursor-pointer hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 text-zinc-400 pointer-events-none" />
    </div>
  );
}

export function FilterBar() {
  const store = useFilterStore();
  const { savedViews, saveView, deleteView } = usePreferencesStore();
  const [showSave, setShowSave] = useState(false);
  const [viewName, setViewName] = useState('');
  const [showViews, setShowViews] = useState(false);

  const handleSave = () => {
    if (!viewName.trim()) return;
    saveView(viewName.trim(), {
      timeRange: store.timeRange,
      comparePrevious: store.comparePrevious,
      siteId: store.siteId,
      buildingId: store.buildingId,
      floorId: store.floorId,
      sectorId: store.sectorId,
      roomId: store.roomId,
      deviceCategory: store.deviceCategory,
      deviceStatus: store.deviceStatus,
    });
    setViewName('');
    setShowSave(false);
  };

  const buildingOpts = store.siteId ? getBuildingsForSite(store.siteId) : buildings;
  const floorOpts = store.buildingId ? getFloorsForBuilding(store.buildingId) : floors;
  const sectorOpts = store.floorId ? getSectorsForFloor(store.floorId) : sectors;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Time presets */}
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-700 pr-3">
          <Clock size={14} className="text-zinc-400" />
          {TIME_PRESETS.map((tp) => (
            <button
              key={tp.value}
              onClick={() => store.setTimePreset(tp.value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                store.timeRange.preset === tp.value
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>

        {/* Compare toggle */}
        <button
          onClick={store.toggleComparePrevious}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            store.comparePrevious
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'border-zinc-200 dark:border-zinc-600 text-zinc-500 hover:border-blue-300'
          }`}
          title="Comparar com período anterior"
        >
          Comparar
        </button>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Spatial filters */}
        <Select
          value={store.siteId}
          onChange={store.setSite}
          options={sites.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Site"
          icon={<MapPin size={12} />}
        />
        <Select
          value={store.buildingId}
          onChange={store.setBuilding}
          options={buildingOpts.map((b) => ({ value: b.id, label: b.name }))}
          placeholder="Prédio"
        />
        <Select
          value={store.floorId}
          onChange={store.setFloor}
          options={floorOpts.map((f) => ({ value: f.id, label: f.name }))}
          placeholder="Andar"
        />
        <Select
          value={store.sectorId}
          onChange={store.setSector}
          options={sectorOpts.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Setor"
        />

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Category / Status */}
        <Select
          value={store.deviceCategory}
          onChange={(v) => store.setDeviceCategory(v as DeviceCategory | null)}
          options={CATEGORIES}
          placeholder="Categoria"
          icon={<Cpu size={12} />}
        />
        <Select
          value={store.deviceStatus}
          onChange={(v) => store.setDeviceStatus(v as DeviceStatus | null)}
          options={STATUSES}
          placeholder="Status"
          icon={<Radio size={12} />}
        />

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Saved views */}
          <div className="relative">
            <button
              onClick={() => setShowViews(!showViews)}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
              title="Visões salvas"
            >
              <Bookmark size={15} />
            </button>
            {showViews && savedViews.length > 0 && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-2 min-w-[180px]">
                {savedViews.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <button onClick={() => { store.applyView(v); setShowViews(false); }} className="text-xs text-zinc-700 dark:text-zinc-300 truncate flex-1 text-left">
                      {v.name}
                    </button>
                    <button onClick={() => deleteView(v.id)} className="text-zinc-400 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <div className="relative">
            <button
              onClick={() => setShowSave(!showSave)}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
              title="Salvar visão"
            >
              <Save size={15} />
            </button>
            {showSave && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 min-w-[200px]">
                <input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Nome da visão"
                  className="w-full text-xs border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1.5 bg-transparent text-zinc-700 dark:text-zinc-300 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
                <button onClick={handleSave} className="w-full text-xs bg-blue-500 text-white rounded py-1.5 font-medium hover:bg-blue-600">
                  Salvar
                </button>
              </div>
            )}
          </div>

          {/* Reset */}
          <button
            onClick={store.resetFilters}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
            title="Limpar filtros"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
