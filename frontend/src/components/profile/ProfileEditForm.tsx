'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getStoredTokens } from '@/lib/auth';
import type { User } from '@/types/auth';
import { useAvatar } from '@/hooks/profile/useAvatar';
import Image from 'next/image';

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  phone: string;
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
  const [picturePreview, setPicturePreview] = useState<string | null>(user.profile_picture);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { avatarData, setAvatarData, updateAvatar } = useAvatar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: { first_name: user.first_name, last_name: user.last_name, phone: user.phone },
  });

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imagenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Max 5 MB');
      return;
    }
    setPictureFile(file);
    setAvatarData(prev => ({ ...prev, image: URL.createObjectURL(file) })); // Update avatar context for immediate preview
    setPicturePreview(URL.createObjectURL(file));
    setError(null);
  }

  async function uploadPicture(): Promise<string | null> {
    if (!pictureFile) return user.profile_picture;
    const formData = new FormData();
    formData.append('file', pictureFile);
    const tokens = getStoredTokens();
    const res = await fetch(`${API_BASE}/auth/profile/upload-picture/`, {
      method: 'POST',
      headers: { ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}) },
      body: formData,
    });
    if (!res.ok) {
      const b = await res.json().catch(() => null);
      throw new Error(b?.error?.message ?? 'Error al subir imagen');
    }
    return (await res.json()).profile_picture;
  }

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      let pic = user.profile_picture;
      if (pictureFile) pic = await uploadPicture();
      await updateAvatar({ ...avatarData, image: pic }); // Update avatar context immediately
      const updated = await apiClient<User>('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          profile_picture: pic,
        }),
      });
      onSave(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div
          className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
        >
          {picturePreview ? (
            <Image 
              fill
              src={avatarData.image || "/images/default-avatar.png"}
              alt="Preview" 
              className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">
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
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Cambiar foto
          </button>
          <p className="text-xs text-muted-fg">JPG, PNG, WebP o GIF. Max 5 MB.</p>
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
          <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-fg">
            Nombre
          </label>
          <input
            id="first_name"
            type="text"
            {...register('first_name', {
              required: 'Requerido',
              minLength: { value: 2, message: 'Min 2' },
            })}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm text-fg transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          {errors.first_name && (
            <p className="mt-1 text-xs text-error">{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-fg">
            Apellido
          </label>
          <input
            id="last_name"
            type="text"
            {...register('last_name', {
              required: 'Requerido',
              minLength: { value: 2, message: 'Min 2' },
            })}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm text-fg transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          {errors.last_name && (
            <p className="mt-1 text-xs text-error">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-fg">
          Telefono
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm text-fg transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
