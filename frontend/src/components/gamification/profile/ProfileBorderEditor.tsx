
import Slider from '../../../components/ui/Slider'
import { ProfileBorder } from '../../../types/gamification';
import { Dispatch, SetStateAction } from 'react';

interface ProfileBorderEditorProps {
  profileBorder: ProfileBorder; 
  onChange: Dispatch<SetStateAction<ProfileBorder>>;
}

export default function ProfileBorderEditor(props: ProfileBorderEditorProps) {
	const { profileBorder, onChange } = props;
	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 
							border border-primary/20 p-6 shadow-sm
							h-full w-full">
			<div className="flex items-center justify-center mb-4 h-full w-full">		
				<div className="flex flex-col gap-4 text-black">
					<label className="font-bold text-lg">Borde</label>
					<span>Color</span>
					<input type="color" value={profileBorder.color} onChange={(e) => onChange({...profileBorder, color: e.target.value})}/>
					<span>Grosor</span>
					<Slider value={profileBorder.width} onChange={(value: number) => onChange({...profileBorder, width: value})} min={0} max={50}/>
					<label className="font-bold text-lg">Sombra</label>
					<span>Color</span>
					<input type="color" value={profileBorder.shadowColor} onChange={(e) => onChange({...profileBorder, shadowColor: e.target.value})}/>
					<span>Grosor</span>
					<Slider value={profileBorder.shadowWidth} onChange={(value: number) => onChange({...profileBorder, shadowWidth: value})} min={0} max={50}/>
				</div>
			</div>
		</article>
	)
}
