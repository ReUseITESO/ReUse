import { format } from 'date-fns';

interface TransactionLocationHighlightProps {
  location: string;
  deliveryDate?: string | null;
  showPrefix?: boolean;
}

function extractLocationParts(location: string) {
  const buildingMatch = location.match(/Edificio\s+([A-Za-z0-9]+)/i);
  const roomMatch = location.match(/Sal[oó]n\s+([A-Za-z0-9-]+)/i);
  const gateMatch = location.match(/Puerta\s+([A-Za-z0-9-]+)/i);
  const meetingMatch = location.match(/Reuni[oó]n\s+(.+)$/i);

  return {
    buildingCode: buildingMatch?.[1] ?? null,
    roomNumber: roomMatch?.[1] ?? null,
    gateNumber: gateMatch?.[1] ?? null,
    meeting: meetingMatch?.[1] ?? null,
  };
}

export default function TransactionLocationHighlight({
  location,
  deliveryDate = null,
  showPrefix = false,
}: TransactionLocationHighlightProps) {
  const { buildingCode, roomNumber, gateNumber, meeting } = extractLocationParts(location);

  const meetingFromDeliveryDate =
    deliveryDate && !Number.isNaN(new Date(deliveryDate).getTime())
      ? format(new Date(deliveryDate), 'dd/MM/yyyy HH:mm')
      : null;

  const meetingLabel = meetingFromDeliveryDate ?? meeting;

  if (!buildingCode && !roomNumber && !gateNumber) {
    return <span>{showPrefix ? `Entrega: ${location}` : location}</span>;
  }

  return (
    <span>
      {showPrefix && <span>Entrega: </span>}

      {buildingCode && (
        <>
          <span>Edificio </span>
          <span className="font-semibold text-primary">{buildingCode}</span>
        </>
      )}

      {gateNumber && !buildingCode && (
        <>
          <span>Puerta </span>
          <span className="font-semibold text-primary">{gateNumber}</span>
        </>
      )}

      {roomNumber && (
        <>
          <span> · Salon </span>
          <span className="font-semibold text-primary">{roomNumber}</span>
        </>
      )}

      {meetingLabel && <span> · Reunion {meetingLabel}</span>}
    </span>
  );
}
