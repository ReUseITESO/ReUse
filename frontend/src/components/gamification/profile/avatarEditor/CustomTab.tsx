
import { Slider }  from '../../../ui/Slider'
import { useAvatar } from '@/hooks/profile/useAvatar';

interface ColorPickerProps {
	title: string;
  	value: string;
  	onChange: (value: string) => void;
  	disabled?: boolean;
}

export function ColorPicker({title, value, onChange, disabled }: ColorPickerProps) {
  return (
	
	<div className="flex items-center justify-between">
		<span className="text-sm font-medium text-muted-fg">{title}</span>
		<div className="flex items-center gap-3">
			<div 
			className={`flex items-center justify-betwee gap-4 p-3 rounded-xl border transition-all
				${disabled 
				? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed text-black' 
				: ''}`}
			>
				<div className="flex items-center gap-3">
					<span className="text-xs font-mono opacity-50 uppercase">{value}</span>
					<input 
					type="color" 
					className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer hover:scale-105 transition-transform"
					value={value} 
					onChange={(e) => onChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	</div>
      
  );
}


export default function CustomTab() {
	const { avatarData, setAvatarData } = useAvatar();
	const isLocked = avatarData.border_type !== 'custom' && avatarData.border_name !== null;

	return (
		<div className="flex flex-col items-center w-full max-w-md mx-auto p-6 space-y-8 bg-card text-card-fg rounded-lg border border-border shadow-sm">
		
			{/* --- Section: Border --- */}
			<section className="w-full space-y-4">
				<div className="flex items-center gap-2 border-b border-border pb-2">
					<div className="w-1 h-6 bg-primary rounded-full" />
					<h2 className="text-h3 font-bold text-fg">Borde</h2>
				</div>

				{/* Color Picker */}
				<ColorPicker 
					title="Color de borde"
					value={avatarData.border_color} 
					onChange={(newColor) => setAvatarData({ ...avatarData, border_color: newColor })} 
					disabled={isLocked}
				/>

				{/* Thickness Slider */}
				<div className="space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium text-muted-fg">Grosor</span>
					<span className="text-xs font-bold text-primary">{avatarData.border_thickness}%</span>
				</div>
				<Slider 
					value={avatarData.border_thickness} 
					onChange={(val) => setAvatarData({ ...avatarData, border_thickness: val })} 
					min={0} max={20} 
					disabled={isLocked}
				/>
				</div>
			</section>

			{/* --- Section: Sombra --- */}
			<section className="w-full space-y-4">
				<div className="flex items-center gap-2 border-b border-border pb-2">
					<div className="w-1 h-6 bg-secondary rounded-full" />
					<h2 className="text-h3 font-bold text-fg">Sombra</h2>
				</div>

				{/* Color Picker */}
				<ColorPicker 
					title="Color de sombra"
					value={avatarData.shadow_color} 
					onChange={(newColor) => setAvatarData({ ...avatarData, shadow_color: newColor })} 
					disabled={isLocked}
				/>

				{/* Shadow Thickness Slider */}
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-muted-fg">Difuminado</span>
						<span className="text-xs font-bold text-secondary">{avatarData.shadow_thickness}%</span>
					</div>
					<Slider 
						value={avatarData.shadow_thickness} 
						onChange={(val) => setAvatarData({ ...avatarData, shadow_thickness: val })} 
						min={0} max={20} 
						disabled={isLocked}
					/>
				</div>
			</section>
			{/* Add this at the end of your CustomTab or Editor container */}
			{isLocked && (
				<div className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
					<button
						onClick={() => setAvatarData(prev => ({ ...prev, border_type: 'custom', border_name: null, }))}
						className="group w-full py-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-error bg-error/5 border-2 border-error/20 rounded-xl hover:bg-error hover:text-white hover:border-error transition-all active:scale-95 shadow-sm"
					>
						{/* Lucide icon or similar for better UX */}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						</svg>
						Remover diseño de borde
					</button>
					
					<p className="mt-2 text-[10px] text-muted-fg font-medium uppercase tracking-tight">
						Esto desbloqueará los controles de personalización
					</p>
				</div>
			)}
		</div>
	);		
}