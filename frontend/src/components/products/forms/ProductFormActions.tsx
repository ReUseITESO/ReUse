import { Save, XCircle } from 'lucide-react';

import Button from '@/components/ui/Button';

interface ProductFormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}

export default function ProductFormActions({
  isSubmitting,
  submitLabel,
  onCancel,
}: ProductFormActionsProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-6">
      <Button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2">
        <Save className="h-4 w-4" />
        {submitLabel}
      </Button>
      <Button
        type="button"
        variant="danger-outline"
        onClick={onCancel}
        className="inline-flex items-center gap-2"
      >
        <XCircle className="h-4 w-4" />
        Cancelar
      </Button>
    </div>
  );
}
