
import Slider from '../../../components/ui/Slider'
import { useAvatar } from '@/hooks/useAvatar';

import { AvatarData } from '../../../types/gamification';


export default function ProfileBorderEditor() {
	const { avatarData, setAvatarData } = useAvatar();

	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 
							border border-primary/20 p-6 shadow-sm
							h-full w-full">
			<div className="flex items-center justify-center mb-4 h-full w-full">		
				<div className="flex flex-col gap-4 text-black">
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
						min={0} max={50}/>
				</div>
			</div>
		</article>
	)
}
