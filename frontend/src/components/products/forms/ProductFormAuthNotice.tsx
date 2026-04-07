interface ProductFormAuthNoticeProps {
  actionLabel: string;
}

export default function ProductFormAuthNotice({ actionLabel }: ProductFormAuthNoticeProps) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-warning/20 bg-warning/5 p-8 text-center">
      <p className="text-body font-medium text-fg">Selecciona un usuario</p>
      <p className="mt-2 text-sm text-warning">
        Usa el selector en la parte superior para elegir un usuario antes de {actionLabel}.
      </p>
    </div>
  );
}
