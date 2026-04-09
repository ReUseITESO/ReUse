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
  'A',
  'A1',
  'A2',
  'A3',
  'B',
  'C',
  'D',
  'F',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'P50',
  'PT',
  'Q',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
  'R',
  'S',
  'S1',
  'S7',
  'T',
  'U',
  'U2',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'Z1',
  'Z3',
  'Z4',
  'Z5',
  'Z6',
  'Z7',
  'PUERTA',
];

const CUSTOM_LAYOUTS: Record<string, RoomRange[]> = {
  A: [
    { start: 104, end: 110 },
    { start: 204, end: 210 },
    { start: 301, end: 310 },
  ],
  A2: [{ start: 1, end: 1 }],
  A3: [{ start: 1, end: 1 }],
  B: [
    { start: 101, end: 113 },
    { start: 201, end: 213 },
  ],
  C: [
    { start: 101, end: 115 },
    { start: 201, end: 213 },
  ],
  D: [
    { start: 101, end: 111 },
    { start: 201, end: 211 },
    { start: 301, end: 311 },
  ],
  F: [
    { start: 101, end: 101 },
    { start: 201, end: 202 },
    { start: 301, end: 301 },
  ],
  H: [
    { start: 101, end: 118 },
    { start: 201, end: 208 },
  ],
  I: [
    { start: 1, end: 1 },
    { start: 202, end: 202 },
  ],
  J: [
    { start: 101, end: 104 },
    { start: 201, end: 204 },
  ],
  K: [{ start: 1, end: 1 }],
  L: [{ start: 1, end: 1 }],
  M: [
    { start: 101, end: 103 },
    { start: 204, end: 205 },
    { start: 222, end: 225 },
    { start: 301, end: 303 },
    { start: 306, end: 317 },
  ],
  M1: [{ start: 1, end: 1 }],
  M2: [{ start: 1, end: 1 }],
  M3: [{ start: 1, end: 1 }],
  N: [{ start: 2, end: 17 }],
  O: [
    { start: 101, end: 110 },
    { start: 201, end: 210 },
    { start: 301, end: 310 },
  ],
  P: [
    { start: 1, end: 1 },
    { start: 201, end: 216 },
    { start: 301, end: 302 },
    { start: 315, end: 316 },
    { start: 401, end: 401 },
  ],
  P50: [{ start: 1, end: 1 }],
  PT: [{ start: 1, end: 1 }],
  Q: [
    { start: 101, end: 109 },
    { start: 201, end: 209 },
    { start: 301, end: 308 },
  ],
  Q1: [{ start: 1, end: 1 }],
  Q2: [{ start: 1, end: 1 }],
  Q3: [{ start: 1, end: 1 }],
  Q4: [{ start: 1, end: 1 }],
  Q5: [
    { start: 101, end: 109 },
    { start: 201, end: 204 },
  ],
  R: [
    { start: 1, end: 1 },
  ],
  S: [
    { start: 101, end: 107 },
    { start: 201, end: 204 },
    { start: 208, end: 208 },
  ],
  S1: [{ start: 1, end: 1 }],
  S7: [{ start: 1, end: 1 }],
  T: [
    { start: 102, end: 120 },
    { start: 201, end: 220 },
    { start: 227, end: 231 },
  ],
  U: [{ start: 1, end: 1 }],
  U2: [{ start: 1, end: 1 }],
  V: [
    { start: 201, end: 204 },
    { start: 301, end: 305 },
    { start: 401, end: 406 },
    { start: 501, end: 512 },
  ],
  W: [
    { start: 101, end: 116 },
    { start: 201, end: 216 },
    { start: 301, end: 316 },
    { start: 316, end: 318 },
  ],
  X: [{ start: 1, end: 1 }],
  Y: [{ start: 1, end: 1 }],
  Z: [{ start: 1, end: 1 }],
  Z1: [{ start: 1, end: 1 }],
  Z2: [{ start: 1, end: 1 }],
  Z3: [{ start: 1, end: 1 }],
  Z4: [{ start: 1, end: 1 }],
  Z5: [{ start: 1, end: 1 }],
  Z6: [{ start: 1, end: 1 }],
  Z7: [{ start: 1, end: 1 }],
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
