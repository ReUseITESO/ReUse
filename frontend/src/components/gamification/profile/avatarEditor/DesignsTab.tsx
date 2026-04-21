import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { useState } from 'react';
import { useAvatar } from '@/hooks/profile/useAvatar';


interface Border {
	"id": number,
	"name": string
	
}


export default function DesignTab() {
	const { avatarData, setAvatarData } = useAvatar();
    const [designs, setDesigns] = useState<Border[]>([
		{ id: 1, name: 'Celestial' },
		{ id: 2, name: 'Fire' },
		{ id: 3, name: 'Monster' },
		{ id: 4, name: 'Star Ribbon' },
	]);
    const [loading, setLoading] = useState(false);

	//   useEffect(() => {
  //     const fetchDesigns = async () => {
  //         try {
  //             const data = await apiClient('/gamification/borders/');
  //             setDesigns(data);
  //         } catch (err) {
  //             console.error("Failed to load borders:", err);
  //         } finally {
  //             setLoading(false);
  //         }
  //     };
  //     fetchDesigns();
  // }, []);

	const handleSelect = (borderPath: string) => {
		
		if (borderPath === avatarData.border_name || avatarData.border_type === 'design') {
			// Deselect if already selected
			setAvatarData((prev) => ({
				...prev,
				border_type: 'custom',
				border_name: null,
			}));
			return;
		} else if (avatarData.border_name !== borderPath) {
			setAvatarData((prev) => ({
				...prev,
				border_type: 'design',
				border_name: borderPath,
			}));
		}
		
    };

    if (loading) return <div className="text-center p-4">Cargando diseños...</div>;

	return (
		  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
        {designs.map((border) => (
            <button
                key={border.id}
                onClick={() => { handleSelect(border.name)}}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200
                    ${avatarData.border_name === border.name
                        ? 'border-secondary bg-secondary/10 shadow-inner scale-[0.98]' 
                        : 'border-transparent bg-primary/5 hover:border-primary/30 hover:scale-105'}`}
            >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-transform group-hover:rotate-3">
                    <Image
                        fill
                        src={getImageUrl(border.name ? `/media/avatars/borders/${border.name}.png` : '')}
                        alt={border.name}
                        className="object-contain p-2"
                        unoptimized
                    />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-tight transition-colors
                    ${avatarData.border_name === border.name ? 'text-secondary' : 'text-primary/60'}`}>
                    {border.name}
                </span>
            </button>
        ))}
    </div>
	)
}