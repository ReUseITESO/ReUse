export interface RoomRange {
  start: number;
  end: number;
}

export interface BuildingDefinition {
  code: string;
  roomRanges: RoomRange[];
}

export const CAMPUS_OPEN_HOUR = 7;
export const CAMPUS_CLOSE_HOUR = 22;

const DEFAULT_ROOM_RANGES: RoomRange[] = [{ start: 100, end: 110 }];
const GATE_ROOM_RANGES: RoomRange[] = [{ start: 1, end: 6 }];

const CAMPUS_BUILDING_CODES = [
  'A',  'A2',  'A3',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',  'Q1',  'Q2',  'Q3',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',  'Z1',  'Z2',  'Z4',
  'PUERTA',
];

const CUSTOM_LAYOUTS: Record<string, RoomRange[]> = {
  A: [{ start: 100, end: 110 }],
  A2: [{ start: 200, end: 210 }],
  A3: [{ start: 300, end: 310 }],
  B: [
    { start: 100, end: 110 },
    { start: 200, end: 210 },
  ],
  F: [
    { start: 100, end: 115 },
    { start: 200, end: 215 },
    { start: 300, end: 315 },
  ],
  PUERTA: GATE_ROOM_RANGES,
};

export const CAMPUS_BUILDINGS: BuildingDefinition[] = CAMPUS_BUILDING_CODES.map(code => {
  const sourceRanges = CUSTOM_LAYOUTS[code] ?? DEFAULT_ROOM_RANGES;

  return {
    code,
    roomRanges: sourceRanges.map(range => ({ ...range })),
  };
});

const CAMPUS_BUILDING_CODES_SET = new Set(CAMPUS_BUILDINGS.map(building => building.code));

export function normalizeCampusBuildingCode(value: string): string {
  const cleanedValue = value
    .trim()
    .toUpperCase()
    .replace('EDIFICIO', '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleanedValue) {
    return '';
  }

  if (cleanedValue.startsWith('PUERTA')) {
    return 'PUERTA';
  }

  return cleanedValue.replace(/[\s-]+/g, '');
}

export function isCampusBuildingCode(buildingCode: string): boolean {
  const normalizedCode = normalizeCampusBuildingCode(buildingCode);
  return CAMPUS_BUILDING_CODES_SET.has(normalizedCode);
}

export function getBuildingCodes(): string[] {
  return CAMPUS_BUILDINGS.map(building => building.code);
}

export function getRoomsForBuilding(buildingCode: string): string[] {
  const normalizedCode = normalizeCampusBuildingCode(buildingCode);
  const building = CAMPUS_BUILDINGS.find(item => item.code === normalizedCode);
  if (!building) {
    return [];
  }

  const rooms = building.roomRanges.flatMap(range => {
    const current: string[] = [];
    for (let room = range.start; room <= range.end; room += 1) {
      current.push(String(room));
    }
    return current;
  });

  return rooms;
}

export function isWithinCampusHours(date: Date): boolean {
  const hour = date.getHours();
  const minutes = date.getMinutes();

  if (hour < CAMPUS_OPEN_HOUR || hour > CAMPUS_CLOSE_HOUR) {
    return false;
  }

  if (hour === CAMPUS_CLOSE_HOUR && minutes > 0) {
    return false;
  }

  return true;
}

export function isCampusClosedDay(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function formatMeetingLocation(params: {
  buildingCode: string;
  roomNumber: string;
}): string {
  const normalizedCode = normalizeCampusBuildingCode(params.buildingCode);

  if (normalizedCode === 'PUERTA') {
    return `Puerta ${params.roomNumber}`;
  }

  return [`Edificio ${normalizedCode}`, `Salon ${params.roomNumber}`].join(' · ');
}
