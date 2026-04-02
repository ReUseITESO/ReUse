interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export default function Input({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  type = 'text',
  disabled = false,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="rounded-lg border border-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    />
  );
}
