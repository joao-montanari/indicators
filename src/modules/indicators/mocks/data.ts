import type {
  Site, Building, Floor, Sector, Room,
  Device, DeviceCategory, DeviceStatus,
} from '../types';

// ─── Sites ──────────────────────────────────────────────
export const sites: Site[] = [
  { id: 'site-1', name: 'Planta São Paulo' },
  { id: 'site-2', name: 'Planta Campinas' },
];

// ─── Buildings ──────────────────────────────────────────
export const buildings: Building[] = [
  { id: 'bld-1', siteId: 'site-1', name: 'Bloco A' },
  { id: 'bld-2', siteId: 'site-1', name: 'Bloco B' },
  { id: 'bld-3', siteId: 'site-2', name: 'Bloco Principal' },
  { id: 'bld-4', siteId: 'site-2', name: 'Bloco Auxiliar' },
];

// ─── Floors ─────────────────────────────────────────────
export const floors: Floor[] = [
  { id: 'fl-1', buildingId: 'bld-1', name: 'Térreo' },
  { id: 'fl-2', buildingId: 'bld-1', name: '1º Andar' },
  { id: 'fl-3', buildingId: 'bld-2', name: 'Térreo' },
  { id: 'fl-4', buildingId: 'bld-2', name: '1º Andar' },
  { id: 'fl-5', buildingId: 'bld-3', name: 'Térreo' },
  { id: 'fl-6', buildingId: 'bld-3', name: '1º Andar' },
  { id: 'fl-7', buildingId: 'bld-4', name: 'Térreo' },
];

// ─── Sectors ────────────────────────────────────────────
export const sectors: Sector[] = [
  { id: 'sec-1', floorId: 'fl-1', name: 'Produção A' },
  { id: 'sec-2', floorId: 'fl-1', name: 'Utilidades' },
  { id: 'sec-3', floorId: 'fl-2', name: 'Administrativo' },
  { id: 'sec-4', floorId: 'fl-3', name: 'Produção B' },
  { id: 'sec-5', floorId: 'fl-3', name: 'Logística' },
  { id: 'sec-6', floorId: 'fl-4', name: 'Manutenção' },
  { id: 'sec-7', floorId: 'fl-5', name: 'Produção C' },
  { id: 'sec-8', floorId: 'fl-5', name: 'Qualidade' },
  { id: 'sec-9', floorId: 'fl-6', name: 'TI / Servidores' },
  { id: 'sec-10', floorId: 'fl-7', name: 'Expedição' },
];

// ─── Rooms ──────────────────────────────────────────────
export const rooms: Room[] = [
  { id: 'rm-1', sectorId: 'sec-1', name: 'Sala de Compressores' },
  { id: 'rm-2', sectorId: 'sec-1', name: 'Linha de Montagem 1' },
  { id: 'rm-3', sectorId: 'sec-1', name: 'Linha de Montagem 2' },
  { id: 'rm-4', sectorId: 'sec-2', name: 'Casa de Máquinas' },
  { id: 'rm-5', sectorId: 'sec-2', name: 'Subestação Elétrica' },
  { id: 'rm-6', sectorId: 'sec-3', name: 'Escritório Central' },
  { id: 'rm-7', sectorId: 'sec-3', name: 'Sala de Reuniões' },
  { id: 'rm-8', sectorId: 'sec-4', name: 'Forno Industrial' },
  { id: 'rm-9', sectorId: 'sec-4', name: 'Estação de Solda' },
  { id: 'rm-10', sectorId: 'sec-5', name: 'Doca de Carga' },
  { id: 'rm-11', sectorId: 'sec-5', name: 'Armazém' },
  { id: 'rm-12', sectorId: 'sec-6', name: 'Oficina Mecânica' },
  { id: 'rm-13', sectorId: 'sec-6', name: 'Almoxarifado' },
  { id: 'rm-14', sectorId: 'sec-7', name: 'Injetoras' },
  { id: 'rm-15', sectorId: 'sec-7', name: 'Extrusão' },
  { id: 'rm-16', sectorId: 'sec-8', name: 'Laboratório' },
  { id: 'rm-17', sectorId: 'sec-9', name: 'Data Center' },
  { id: 'rm-18', sectorId: 'sec-9', name: 'NOC' },
  { id: 'rm-19', sectorId: 'sec-10', name: 'Área de Separação' },
  { id: 'rm-20', sectorId: 'sec-10', name: 'Pátio de Veículos' },
];

// ─── Device templates ───────────────────────────────────
const deviceTemplates: { prefix: string; category: DeviceCategory }[] = [
  { prefix: 'Sensor Temp.', category: 'sensor' },
  { prefix: 'Sensor Umid.', category: 'sensor' },
  { prefix: 'Sensor Pressão', category: 'sensor' },
  { prefix: 'Sensor Vibração', category: 'sensor' },
  { prefix: 'Medidor Energia', category: 'meter' },
  { prefix: 'Medidor Vazão', category: 'meter' },
  { prefix: 'CLP', category: 'controller' },
  { prefix: 'Atuador Válvula', category: 'actuator' },
  { prefix: 'Gateway IoT', category: 'gateway' },
];

function pickStatus(hash: number): DeviceStatus {
  const v = ((hash * 2654435761) >>> 0) % 100;
  if (v < 78) return 'online';
  if (v < 88) return 'alert';
  if (v < 95) return 'offline';
  return 'maintenance';
}

// Generate devices procedurally
function generateDevices(): Device[] {
  const result: Device[] = [];
  let idx = 0;
  for (const room of rooms) {
    const sector = sectors.find((s) => s.id === room.sectorId)!;
    const count = 3 + ((idx * 7) % 4); // 3-6 devices per room
    for (let d = 0; d < count; d++) {
      const tpl = deviceTemplates[(idx + d) % deviceTemplates.length];
      const id = `dev-${idx * 10 + d}`;
      result.push({
        id,
        name: `${tpl.prefix} ${sector.name} #${d + 1}`,
        category: tpl.category,
        status: pickStatus(idx * 10 + d),
        sectorId: room.sectorId,
        roomId: room.id,
        lastSeen: new Date(Date.now() - ((idx + d) % 60) * 60_000).toISOString(),
      });
    }
    idx++;
  }
  return result;
}

export const devices: Device[] = generateDevices();

// ─── Equipment ──────────────────────────────────────────
export const equipmentList = [
  { name: 'Compressor Atlas Copco GA-90', type: 'Compressor', sectorId: 'sec-1' },
  { name: 'Motor WEG W22 150cv', type: 'Motor Elétrico', sectorId: 'sec-1' },
  { name: 'Bomba KSB Megachem', type: 'Bomba', sectorId: 'sec-2' },
  { name: 'Chiller Carrier 30XA', type: 'Chiller', sectorId: 'sec-2' },
  { name: 'Gerador Cummins 500kVA', type: 'Gerador', sectorId: 'sec-2' },
  { name: 'Transformador Siemens 1000kVA', type: 'Transformador', sectorId: 'sec-5' },
  { name: 'Forno Industrial Ipsen', type: 'Forno', sectorId: 'sec-4' },
  { name: 'Torre de Resfriamento BAC', type: 'Torre', sectorId: 'sec-4' },
  { name: 'Injetora Haitian MA-3200', type: 'Injetora', sectorId: 'sec-7' },
  { name: 'Extrusora Battenfeld', type: 'Extrusora', sectorId: 'sec-7' },
  { name: 'UPS Eaton 93PM 200kVA', type: 'No-break', sectorId: 'sec-9' },
  { name: 'CRAC Vertiv Liebert', type: 'Climatização', sectorId: 'sec-9' },
];

// ─── Alert templates ────────────────────────────────────
export const alertTemplates = [
  { title: 'Temperatura elevada', message: 'Temperatura acima do limiar de segurança', category: 'thermal', severity: 'critical' as const },
  { title: 'Sensor offline', message: 'Dispositivo não responde há mais de 5 min', category: 'connectivity', severity: 'warning' as const },
  { title: 'Consumo acima do esperado', message: 'Consumo 30% acima da média do período', category: 'energy', severity: 'warning' as const },
  { title: 'Vibração anormal', message: 'Padrão de vibração fora da faixa operacional', category: 'mechanical', severity: 'critical' as const },
  { title: 'Falha de comunicação', message: 'Gateway sem comunicação com a rede', category: 'connectivity', severity: 'emergency' as const },
  { title: 'Umidade fora da faixa', message: 'Umidade relativa acima de 80%', category: 'environmental', severity: 'info' as const },
  { title: 'Pico de corrente', message: 'Pico de corrente detectado no circuito', category: 'electrical', severity: 'critical' as const },
  { title: 'Manutenção vencida', message: 'Equipamento com manutenção preventiva atrasada', category: 'maintenance', severity: 'warning' as const },
  { title: 'Vazamento detectado', message: 'Possível vazamento de fluido refrigerante', category: 'safety', severity: 'emergency' as const },
  { title: 'Pressão baixa', message: 'Pressão no sistema pneumático abaixo do mínimo', category: 'mechanical', severity: 'warning' as const },
];

// Helper getters
export function getBuildingsForSite(siteId: string) {
  return buildings.filter((b) => b.siteId === siteId);
}
export function getFloorsForBuilding(buildingId: string) {
  return floors.filter((f) => f.buildingId === buildingId);
}
export function getSectorsForFloor(floorId: string) {
  return sectors.filter((s) => s.floorId === floorId);
}
export function getRoomsForSector(sectorId: string) {
  return rooms.filter((r) => r.sectorId === sectorId);
}
export function getDevicesForSector(sectorId: string) {
  return devices.filter((d) => d.sectorId === sectorId);
}
export function getSectorName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}
