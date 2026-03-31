interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'template' | 'danger' | 'danger-outline' | 'success';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50';

  const variantStyles = {
    primary: 'bg-btn-primary text-btn-primary-fg hover:bg-primary-hover',
    secondary: 'bg-btn-secondary text-btn-secondary-fg hover:bg-secondary-hover',
    template: 'border border-btn-tmpl-border bg-btn-tmpl text-primary hover:bg-btn-tmpl-hover',
    danger: 'bg-error text-error-fg hover:opacity-90',
    'danger-outline': 'border border-error bg-transparent text-error hover:bg-error/5',
    success: 'bg-success text-success-fg hover:bg-success-hover',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
