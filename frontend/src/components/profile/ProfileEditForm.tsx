'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, X } from 'lucide-react';

import { apiClient } from '@/lib/api';
import { getStoredTokens } from '@/lib/auth';

import type { User } from '@/types/auth';

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  interests: string[];
}

interface ProfileEditFormProps {
  user: User;
  onSave: (updated: User) => void;
  onCancel: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function ProfileEditForm({ user, onSave, onCancel }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interestInput, setInterestInput] = useState('');
  const [picturePreview, setPicturePreview] = useState<string | null>(user.profile_picture);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      interests: user.interests ?? [],
    },
  });

  const interests = watch('interests');

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB');
      return;
    }

    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
    setError(null);
  }

  function handleAddInterest() {
    const trimmed = interestInput.trim();
    if (!trimmed) return;
    if (interests.length >= 10) return;
    if (interests.includes(trimmed)) return;
    setValue('interests', [...interests, trimmed]);
    setInterestInput('');
  }

  function handleRemoveInterest(index: number) {
    setValue('interests', interests.filter((_, i) => i !== index));
  }

  function handleInterestKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  }

  async function uploadPicture(): Promise<string | null> {
    if (!pictureFile) return user.profile_picture;

    const formData = new FormData();
    formData.append('file', pictureFile);

    const tokens = getStoredTokens();
    const res = await fetch(`${API_BASE}/auth/profile/upload-picture/`, {
      method: 'POST',
      headers: {
        ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error?.message ?? 'Error al subir la imagen');
    }

    const data = await res.json();
    return data.profile_picture;
  }

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      let profilePictureUrl = user.profile_picture;

      if (pictureFile) {
        profilePictureUrl = await uploadPicture();
      }

      const updated = await apiClient<User>('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          profile_picture: profilePictureUrl,
          interests: data.interests,
        }),
      });
      onSave(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Profile picture */}
      <div className="flex items-center gap-4">
        <div
          className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-blue-100"
          onClick={() => fileInputRef.current?.click()}
        >
          {picturePreview ? (
            <img src={picturePreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-blue-600">
              {user.first_name?.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Cambiar foto
          </button>
          <p className="text-xs text-slate-500">JPG, PNG, WebP o GIF. Max 5 MB.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="first_name"
            type="text"
            {...register('first_name', { required: 'El nombre es requerido', minLength: { value: 2, message: 'Minimo 2 caracteres' } })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.first_name && (
            <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-slate-700">
            Apellido
          </label>
          <input
            id="last_name"
            type="text"
            {...register('last_name', { required: 'El apellido es requerido', minLength: { value: 2, message: 'Minimo 2 caracteres' } })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.last_name && (
            <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
          Telefono
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Intereses ({interests.length}/10)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={interestInput}
            onChange={e => setInterestInput(e.target.value)}
            onKeyDown={handleInterestKeyDown}
            placeholder="Ej: Libros, Electronica, Deportes"
            maxLength={50}
            disabled={interests.length >= 10}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleAddInterest}
            disabled={interests.length >= 10 || !interestInput.trim()}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
        {interests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className="rounded-full p-0.5 transition-colors hover:bg-blue-200"
                  aria-label={`Eliminar ${interest}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
