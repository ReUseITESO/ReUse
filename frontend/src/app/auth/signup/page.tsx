'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface FormErrors {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  password?: string;
  password_confirm?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    router.replace('/products');
    return null;
  }

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  const PHONE_REGEX = /^\+?\d{10,15}$/;

  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Débil', color: 'bg-error', width: '20%' };
    if (score === 2) return { label: 'Regular', color: 'bg-warning', width: '40%' };
    if (score === 3) return { label: 'Aceptable', color: 'bg-warning', width: '60%' };
    if (score === 4) return { label: 'Fuerte', color: 'bg-success', width: '80%' };
    return { label: 'Muy fuerte', color: 'bg-success', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^@]+@iteso\.mx$/i.test(form.email.trim())) {
      newErrors.email = 'Debe ser un correo @iteso.mx';
    }

    const firstName = form.first_name.trim();
    if (!firstName) {
      newErrors.first_name = 'El nombre es obligatorio.';
    } else if (firstName.length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres.';
    } else if (firstName.length > 50) {
      newErrors.first_name = 'El nombre no puede exceder 50 caracteres.';
    } else if (!NAME_REGEX.test(firstName)) {
      newErrors.first_name = 'El nombre solo puede contener letras y espacios.';
    }

    const lastName = form.last_name.trim();
    if (!lastName) {
      newErrors.last_name = 'El apellido es obligatorio.';
    } else if (lastName.length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres.';
    } else if (lastName.length > 50) {
      newErrors.last_name = 'El apellido no puede exceder 50 caracteres.';
    } else if (!NAME_REGEX.test(lastName)) {
      newErrors.last_name = 'El apellido solo puede contener letras y espacios.';
    }

    const phone = form.phone.replace(/[\s()-]/g, '');
    if (!phone) {
      newErrors.phone = 'El teléfono es obligatorio.';
    } else if (!PHONE_REGEX.test(phone)) {
      newErrors.phone = 'Ingresa un número válido (10-15 dígitos, puede iniciar con +).';
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (form.password.length > 128) {
      newErrors.password = 'La contraseña no puede exceder 128 caracteres.';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Debe contener al menos una mayúscula.';
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = 'Debe contener al menos una minúscula.';
    } else if (!/\d/.test(form.password)) {
      newErrors.password = 'Debe contener al menos un número.';
    }

    if (!form.password_confirm) {
      newErrors.password_confirm = 'Debes confirmar la contraseña.';
    } else if (form.password !== form.password_confirm) {
      newErrors.password_confirm = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signUp({
        email: form.email.trim().toLowerCase(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
      });
      // Account created but needs email verification before login
      router.push('/auth/verify-notice');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (fieldError?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-fg placeholder-muted-fg
     focus:outline-none focus:ring-2 disabled:opacity-50
     ${fieldError ? 'border-error focus:border-error focus:ring-error' : 'border-input focus:border-ring focus:ring-ring'}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img src="/ReUseITESOLogo.png" alt="ReUseITESO logo" className="mx-auto mb-3 h-12 w-12 object-contain" />
          <h1 className="text-h1 font-bold text-fg">ReUseITESO</h1>
          <p className="mt-2 text-muted-fg">Crea tu cuenta con tu correo ITESO</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-fg">
              Correo ITESO <span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu.nombre@iteso.mx"
              value={form.email}
              onChange={handleChange('email')}
              disabled={isSubmitting}
              className={inputClass(errors.email)}
            />
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-fg">
                Nombre <span className="text-error">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                placeholder="Juan"
                value={form.first_name}
                onChange={handleChange('first_name')}
                disabled={isSubmitting}
                className={inputClass(errors.first_name)}
              />
              {errors.first_name && <p className="mt-1 text-xs text-error">{errors.first_name}</p>}
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-fg">
                Apellido <span className="text-error">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                placeholder="Pérez"
                value={form.last_name}
                onChange={handleChange('last_name')}
                disabled={isSubmitting}
                className={inputClass(errors.last_name)}
              />
              {errors.last_name && <p className="mt-1 text-xs text-error">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-fg">
              Teléfono <span className="text-error">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="33 1234 5678"
              value={form.phone}
              onChange={handleChange('phone')}
              disabled={isSubmitting}
              className={inputClass(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-fg">
              Contraseña <span className="text-error">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange('password')}
              disabled={isSubmitting}
              className={inputClass(errors.password)}
            />
            {form.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <span className="text-xs text-muted-fg">{passwordStrength.label}</span>
                </div>
              </div>
            )}
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="password_confirm" className="mb-1 block text-sm font-medium text-fg">
              Confirmar contraseña <span className="text-error">*</span>
            </label>
            <input
              id="password_confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={form.password_confirm}
              onChange={handleChange('password_confirm')}
              disabled={isSubmitting}
              className={inputClass(errors.password_confirm)}
            />
            {errors.password_confirm && (
              <p className="mt-1 text-xs text-error">{errors.password_confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-btn-primary px-4 py-2.5 font-medium text-btn-primary-fg transition-colors
                       hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-fg">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/signin" className="font-medium text-primary hover:text-primary-hover">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
