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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^@]+@iteso\.mx$/i.test(form.email.trim())) {
      newErrors.email = 'Debe ser un correo @iteso.mx';
    }

    if (!form.first_name.trim() || form.first_name.trim().length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!form.last_name.trim() || form.last_name.trim().length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres.';
    }

    if (form.phone.trim() && !/^\+?\d{7,20}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Número de teléfono inválido.';
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (form.password !== form.password_confirm) {
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
      router.push('/products');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (fieldError?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400
     focus:outline-none focus:ring-2 disabled:opacity-50
     ${fieldError ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">ReUseITESO</h1>
          <p className="mt-2 text-gray-500">Crea tu cuenta con tu correo ITESO</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Correo ITESO <span className="text-red-500">*</span>
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
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
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
              {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                Apellido <span className="text-red-500">*</span>
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
              {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Teléfono
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
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña <span className="text-red-500">*</span>
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
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="password_confirm" className="mb-1 block text-sm font-medium text-gray-700">
              Confirmar contraseña <span className="text-red-500">*</span>
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
              <p className="mt-1 text-xs text-red-600">{errors.password_confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors
                       hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
