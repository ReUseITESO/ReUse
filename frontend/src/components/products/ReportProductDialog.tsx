'use client';

import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';

import Button from '@/components/ui/Button';
import AppSelect from '@/components/ui/AppSelect';

const REASON_OPTIONS = [
  { value: 'prohibited_item', label: 'Artículo prohibido' },
  { value: 'misleading_description', label: 'Descripción engañosa' },
  { value: 'offensive_content', label: 'Contenido ofensivo' },
  { value: 'possible_scam', label: 'Posible fraude' },
  { value: 'other', label: 'Otro' },
];

const INPUT_CLASS =
  'w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring';

interface ReportProductDialogProps {
  isOpen: boolean;
  productTitle: string;
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (reason: string, description: string) => void;
}

export default function ReportProductDialog({
  isOpen,
  productTitle,
  isLoading,
  error,
  onCancel,
  onSubmit,
}: ReportProductDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setDescription('');
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit() {
    if (!reason) {
      setValidationError('Selecciona un motivo para continuar.');
      return;
    }
    setValidationError(null);
    onSubmit(reason, description.trim());
  }

  const displayError = validationError ?? error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5 text-error" />
          <h2 className="font-semibold text-card-fg">Reportar artículo</h2>
        </div>

        <p className="mb-5 text-sm text-muted-fg">
          Estás reportando: <span className="font-medium text-fg">{productTitle}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Motivo <span className="text-error">*</span>
            </label>
            <AppSelect
              value={reason}
              onValueChange={setReason}
              placeholder="Selecciona un motivo"
              options={REASON_OPTIONS}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Descripción adicional <span className="text-muted-fg">(opcional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Agrega más detalles sobre el problema..."
            />
            <p className="mt-1 text-right text-xs text-muted-fg">{description.length}/300</p>
          </div>
        </div>

        {displayError && (
          <p className="mt-4 rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {displayError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="template" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        </div>
      </div>
    </div>
  );
}
