import ZoomSlider from '../../../components/ui/ZoomSlider';

import { useAvatar } from '@/hooks/profile/useAvatar';
import Avatar from '../../../components/gamification/profile/Avatar';

export default function ProfilePictureDraft() {
  const { avatarData, setAvatarData, isLoading: isLoadingAvatar, updateAvatar } = useAvatar();

  if (isLoadingAvatar) return <p>Cargando...</p>;

  const handleSave = async (): Promise<void> => {
    const result = await updateAvatar(avatarData);
    if (result.success) alert('¡Avatar Actualizado!');
  };

  return (
    <article className="h-full flex flex-col w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto rounded-2xl bg-gradient-to-br from-primary/5 to-primary/15 border border-primary/20 p-8 md:p-10 shadow-xl flex flex-col items-center gap-y-10">
      {/* Avatar Container: Uses percentage-based width and relative aspect ratio */}
      <div className="w-full aspect-square flex items-center justify-center rounded-full overflow-hidden">
        <Avatar movable={true} />
      </div>

      {/* Interaction Group: Spaced via gap-y instead of top margins */}
      <div className="w-full flex flex-col gap-y-6">
        <div className="space-y-3">
          <label className="block text-secondary font-bold text-sm uppercase tracking-widest text-center">
            Nivel de Zoom
          </label>
          <ZoomSlider
            zoom={avatarData.zoom_level}
            onChange={newZoom => setAvatarData(prev => ({ ...prev, zoom_level: newZoom }))}
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            className="w-full sm:w-auto min-w-[200px] bg-primary text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:bg-primary-hover hover:scale-105 active:scale-95 shadow-xl shadow-primary/25"
            onClick={handleSave}
          >
            Salvar Cambios
          </button>
        </div>
      </div>
    </article>
  );
}
