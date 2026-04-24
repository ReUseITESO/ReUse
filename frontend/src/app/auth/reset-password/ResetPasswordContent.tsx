'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset, ApiError } from '@/lib/auth';

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

const inputClass = (hasError?: boolean) =>
  `w-full rounded-lg border px-4 py-2.5 text-fg
   focus:outline-none focus:ring-2 disabled:opacity-50
   ${hasError ? 'border-error focus:border-error focus:ring-error' : 'border-border bg-input focus:ring-primary'}`;

export default function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [serverError, setServerError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);

  if (!token) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-fg mb-3">Enlace inválido</h1>
          <p className="text-sm text-muted-fg mb-6">
            Este enlace no es válido. Solicita uno nuevo.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-lg bg-btn-primary px-4 py-2.5 font-medium
                       text-btn-primary-fg transition-colors hover:bg-primary-hover"
          >
            Solicitar nuevo enlace
          </Link>
        </section>
      </main>
    );
  }

  function validateFields(): boolean {
    let valid = true;
    setPasswordError('');
    setConfirmError('');

    if (!newPassword) {
      setPasswordError('La contraseña es obligatoria.');
      valid = false;
    } else if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      valid = false;
    } else if (newPassword.length > 128) {
      setPasswordError('La contraseña no puede exceder 128 caracteres.');
      valid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Debe contener al menos una mayúscula.');
      valid = false;
    } else if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Debe contener al menos una minúscula.');
      valid = false;
    } else if (!/\d/.test(newPassword)) {
      setPasswordError('Debe contener al menos un número.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Debes confirmar la contraseña.');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    setErrorCode('');

    if (!validateFields()) return;

    setIsLoading(true);
    try {
      await confirmPasswordReset(token, newPassword, confirmPassword);
      setSuccess(true);
      setTimeout(() => router.replace('/auth/signin'), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorCode(err.code);
        setServerError(err.message);
      } else {
        setServerError('No se pudo restablecer la contraseña. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-fg mb-3">Contraseña restablecida</h1>
          <p className="text-sm text-muted-fg">Redirigiendo a inicio de sesión...</p>
        </section>
      </main>
    );
  }

  const isExpiredOrUsed = errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_USED';

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-fg mb-2">Nueva contraseña</h1>
        <p className="text-sm text-muted-fg mb-6">Ingresa y confirma tu nueva contraseña.</p>

        {serverError && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            <p>{serverError}</p>
            {isExpiredOrUsed && (
              <Link
                href="/auth/forgot-password"
                className="mt-2 inline-block font-medium underline"
              >
                Solicitar nuevo enlace
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-fg">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                setPasswordError('');
              }}
              disabled={isLoading}
              className={inputClass(!!passwordError)}
            />
            {newPassword && (
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
            {passwordError && <p className="mt-1 text-xs text-error">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-fg">
              Confirmar contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                setConfirmError('');
              }}
              disabled={isLoading}
              className={inputClass(!!confirmError)}
            />
            {confirmError && <p className="mt-1 text-xs text-error">{confirmError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-btn-primary py-2.5 font-medium text-btn-primary-fg
                       transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
}
