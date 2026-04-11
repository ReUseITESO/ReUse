
import Slider from '../../../components/ui/Slider'
import { useAvatar } from '@/hooks/profile/useAvatar';

import { AvatarData } from '../../../types/gamification';
import { useState } from 'react';

import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

function CustomTab() {
	const { avatarData, setAvatarData } = useAvatar();

	return (
		<div className="flex flex-col flex-center gap-4 text-black">
			<label className="font-bold text-lg">Borde</label>
			<span>Color</span>
			<input type="color" 
				value={avatarData.border_color} 
				onChange={(e) => setAvatarData((prev : AvatarData) => ({...prev, border_color: e.target.value}))}/>
			<span>Grosor</span>
			<Slider 
				value={avatarData.border_thickness} 
				onChange={(value: number) => setAvatarData((prev : AvatarData) => ({...prev, border_thickness: value}))} 
				min={0} max={50}/>
			<label className="font-bold text-lg">Sombra</label>
			<span>Color</span>
			<input type="color" 
				value={avatarData.shadow_color} 
				onChange={(e) => setAvatarData((prev : AvatarData) => ({...prev, shadow_color: e.target.value}))}/>
			<span>Grosor</span>
			<Slider 
				value={avatarData.shadow_thickness} 
				onChange={(value: number) => setAvatarData( (prev : AvatarData) => ({...prev, shadow_thickness: value}))} 
				min={0} max={150}/>
		</div>)
}

interface Border {
	"id": number,
	"name": string
	
}

function DesignTab() {
	const { avatarData, setAvatarData } = useAvatar();
    const [designs, setDesigns] = useState<Border[]>([
		{ id: 1, name: 'Celestial' },
		{ id: 2, name: 'Fire' },
		{ id: 3, name: 'Monster' },
		{ id: 4, name: 'Star Ribbon' },
	]);
    const [loading, setLoading] = useState(false);

	// useEffect(() => {
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
		if (borderPath === avatarData.border_name) {
			// Deselect if already selected
			setAvatarData((prev) => ({
				...prev,
				border_type: 'custom',
				border_name: null,
			}));
			return;
		} else {
			setAvatarData((prev) => ({
				...prev,
				border_type: 'design',
				border_name: borderPath,
			}));
		}
    };

    if (loading) return <div className="text-center p-4">Cargando diseños...</div>;

	return (
		// <div className="flex flex-col gap-4 text-black">
		// 	<Image
		// 		width="200"
		// 		height="200"
		// 		src={getImageUrl('/media/avatars/borders/Celestial.png')}
		// 		alt="border design" 
		// 		unoptimized>
		// 	</Image>
		// </div>
		<div className="grid grid-cols-2 gap-4 w-full">
            {designs.map((border) => (
                <button
                    key={border.id}
                    onClick={() => handleSelect(border.name)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
							${avatarData.border_name === border.name
                            ? 'border-primary bg-primary/10 shadow-md' 
                             : 'border-transparent bg-white/50 hover:border-primary/30 hover:bg-white'}`}
                >
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-black/5">
                        <Image
                            fill
                            src={getImageUrl(border.name ? `/media/avatars/borders/${border.name}.png` : '')}
                            alt={border.name}
                            className="object-contain p-1"
                            unoptimized
                        />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-gray-700 truncate w-full text-center">
                        {border.name}
                    </span>
                </button>
            ))}
        </div>
	)
}

function TabIndex(props: { setActiveTab: (tab: string) => void, activeTab: string }) {
	const { setActiveTab, activeTab } = props;

	const tabs = [
		{ id: 'custom', label: 'Custom' },
		{ id: 'designs', label: 'Diseños' },
		{ id: 'others', label: 'Otros' }
	];

	return (
	<>
		<ul className="left-0 flex items-start justify-center mt-2 w-full rounded-md bg-white border border-primary/20 shadow-lg z-20 py-1 overflow-hidden">
        	{tabs.map((tab) => (
			<li key={tab.id}>
				<button
				onClick={() => {
					setActiveTab(tab.id);
				}}
				className={`w-full text-left px-4 py-2 text-sm transition-colors
					${activeTab === tab.id 
					? 'bg-primary text-white' 
					: 'text-black hover:bg-primary/10'}`}
				>
				{tab.label}
				</button>
			</li>
			))}
      	</ul>
	</>
	)
}

export default function ProfileBorderEditor() {
	const [ tab, setTab ] = useState('custom')

	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 
							border border-primary/20 p-6 shadow-sm
							h-full w-full">
			<div className="flex flex-col mb-4 h-full w-full">
				<div className="w-full h-[15%] top-10 flex items-start justify-center">
					<TabIndex setActiveTab={setTab} activeTab={tab}/>
				</div>
				<div className="w-full h-[85%] flex items-start justify-center">
					{(tab === 'custom') ? 
						<CustomTab />
					:
						<DesignTab />
					}
				</div>
			</div>
		</article>
	)
}
