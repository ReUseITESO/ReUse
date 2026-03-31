import { Building2, MapPinned } from 'lucide-react';

import DateTimePicker from '@/components/ui/DateTimePicker';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  CAMPUS_CLOSE_HOUR,
  CAMPUS_OPEN_HOUR,
  getBuildingCodes,
  getRoomsForBuilding,
  normalizeCampusBuildingCode,
} from '@/lib/campusLocations';
import type { MeetingLocationFieldsProps } from '@/types/transaction';

export default function MeetingLocationFields({
  buildingCode,
  roomNumber,
  meetingDateTime,
  disabled,
  onBuildingChange,
  onRoomChange,
  onDateTimeChange,
  onTimeErrorChange,
}: MeetingLocationFieldsProps) {
  const rooms = getRoomsForBuilding(buildingCode);
  const buildingOptions = getBuildingCodes().map(code => ({
    value: code,
    label: code === 'PUERTA' ? 'Puerta' : code,
  }));
  const isGate = normalizeCampusBuildingCode(buildingCode) === 'PUERTA';

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">
            Edificio <span className="text-error">*</span>
          </label>
          <div className="inline-flex w-full items-center gap-2 rounded-lg border border-input bg-muted px-2 py-1">
            <Building2 className="h-4 w-4 text-secondary" />
            <SearchableSelect
              value={buildingCode}
              onValueChange={value => onBuildingChange(normalizeCampusBuildingCode(value))}
              placeholder="Selecciona edificio o puerta"
              options={buildingOptions}
              disabled={disabled}
              optionLayout="grid"
              inputClassName="h-8 border-0 bg-transparent px-1 focus:border-transparent focus:ring-0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">
            {isGate ? 'Numero' : 'Salon'} <span className="text-error">*</span>
          </label>
          <div className="inline-flex w-full items-center gap-2 rounded-lg border border-input bg-muted px-2 py-1">
            <MapPinned className="h-4 w-4 text-info" />
            <SearchableSelect
              value={roomNumber}
              onValueChange={value => onRoomChange(value.trim())}
              placeholder={
                buildingCode
                  ? isGate
                    ? 'Selecciona numero de puerta'
                    : 'Busca o escribe salon'
                  : 'Selecciona edificio primero'
              }
              options={rooms.map(room => ({ value: room, label: room }))}
              disabled={disabled || !buildingCode}
              emptyMessage={isGate ? 'Sin numeros para esta puerta' : 'Sin salones para este edificio'}
              optionLayout="grid"
              inputClassName="h-8 border-0 bg-transparent px-1 focus:border-transparent focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-fg">
          Fecha y hora de reunión <span className="text-error">*</span>
        </label>
        <DateTimePicker
          value={meetingDateTime}
          onChange={onDateTimeChange}
          disabled={disabled}
          minHour={CAMPUS_OPEN_HOUR}
          maxHour={CAMPUS_CLOSE_HOUR}
          onInvalidTimeChange={onTimeErrorChange}
        />
      </div>
    </div>
  );
}
