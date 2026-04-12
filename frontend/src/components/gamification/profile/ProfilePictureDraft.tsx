import ZoomSlider from '../../../components/ui/ZoomSlider';

import { useAvatar } from '@/hooks/profile/useAvatar';
import { AvatarData } from '../../../types/gamification';
import Avatar from '../../../components/gamification/profile/Avatar';

export default function ProfilePictureDraft() {
  const { avatarData, setAvatarData, isLoading: isLoadingAvatar, updateAvatar } = useAvatar();
  if (isLoadingAvatar) return <p>Cargando...</p>;

  const handleSave = async (): Promise<void> => {
    const result = await updateAvatar(avatarData);
    if (result.success) alert('Saved!');
  };

  return (
    <article
      className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 border 
							border-primary/20 p-6 shadow-sm w-full h-full
							w-full h-full flex flex-col items-center justify-center"
    >
      <div className="flex items-center justify-center aspect-square w-full mx-[20px] p-4">
        <Avatar movable={true} />
      </div>
      <div className="mt-4 text-center mx-[20px] w-full h-auto p-4">
        <ZoomSlider
          zoom={avatarData.zoom_level}
          onChange={newZoom =>
            setAvatarData((prev: AvatarData) => ({ ...prev, zoom_level: newZoom }))
          }
        />
      </div>
      <div className="mt-4 text-center p-4">
        <button className="bg-btn-primary p-[20px] w-auto rounded" onClick={handleSave}>
          Salvar Cambios
        </button>
      </div>
    </article>
  );
}
