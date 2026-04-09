import Image from 'next/image';
import ZoomSlider from '../../../components/ui/ZoomSlider';

import { useAvatar } from '@/hooks/profile/useAvatar';

import { AvatarData } from '../../../types/gamification';
import { useState, useRef } from 'react';

const getImageUrl = (imagePath: string | null | undefined) => {
  const BACKEND_URL = 'http://localhost:8000';
  
  // Handle empty state or null
  if (!imagePath || imagePath === "") {
    return `${BACKEND_URL}/media/avatars/default.png`;
  }

  // Handle absolute URLs
  if (imagePath.startsWith('http')) return imagePath;

  // Normalize path to plural 'avatars' and include /media/ prefix
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  if (cleanPath.startsWith('/media/')) {
    return `${BACKEND_URL}${cleanPath}`;
  }

  return `${BACKEND_URL}/media${cleanPath}`;
};

function getProfileBorderStyle(profileBorder: AvatarData) {
	return {
		boxShadow: `inset 0 0 0 ${profileBorder.border_thickness}px ${profileBorder.border_color}, ${profileBorder.shadow_color} 0px 0px ${profileBorder.shadow_thickness}px`,
		//boxShadow: `${profileBorder.shadowColor} 0px 0px ${profileBorder.shadowWidth}px`,
	}
}

function getProfilePictureStyle(zoomLevel: number, posX: number, posY: number) {
	return {
		transform: `scale(${zoomLevel})`, // For your zoom feature
		objectPosition: `${posX}px ${posY}px` // For your positioning feature
	}
}

export default function ProfilePictureDraft() {
	const { avatarData, setAvatarData, isLoading: isLoadingAvatar , updateAvatar } = useAvatar();
	console.log('Avatar data in component:', avatarData);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	if (isLoadingAvatar) return <p>Cargando...</p>;

	const handleSave = async (): Promise<void> => {
		const result =  await updateAvatar(avatarData);
		if (result.success)
			alert("Saved!");
	};



	const profileBorderStyle = getProfileBorderStyle(avatarData);
	const profilePictureStyle = getProfilePictureStyle(avatarData.zoom_level, avatarData.offset_x, avatarData.offset_y);

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDragging) return;
		
		// movementX/Y provides the delta since the last event
		setAvatarData({
			...avatarData,
			offset_x: avatarData.offset_x + e.movementX/avatarData.zoom_level, // Adjust for zoom level
			offset_y: avatarData.offset_y + e.movementY/avatarData.zoom_level, // Adjust for zoom level
		});
		
	}

	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 border 
							border-primary/20 p-6 shadow-sm
							w-full h-full flex flex-col items-center justify-center">
								
			<div className="flex items-center justify-center w-full h-full mx-[20px]">
				{/* Profile Border Container */}
				<div 
					id="profile-border" 
					className="relative h-[400px] w-[400px] 
								rounded-full overflow-hidden 
								flex items-center justify-center"
					style={{...profileBorderStyle, backgroundColor: avatarData.border_color}}
					onPointerDown={() => setIsDragging(true)}
					onPointerUp={() => setIsDragging(false)}
					onPointerLeave={() => setIsDragging(false)}
					onPointerMove={handlePointerMove}
				>
					{/* Background Color layer */}
					<div className="absolute inset-0" style={{ backgroundColor: avatarData.border_color }} />

					{/* Image Container */}
					<div 
						ref={containerRef}>
						<Image 
							src={getImageUrl(avatarData.image)} 
							alt="profile picture" 
							fill
							className="object-cover pointer-events-none"
							style={profilePictureStyle}
							unoptimized
							draggable={true}
						/>
					</div>

					{/* 3. Border/Shadow Layer*/}
					<div 
						className="absolute inset-0 rounded-full pointer-events-none" 
						style={getProfileBorderStyle(avatarData)} />
				</div>
			</div>
			<div className="mt-4 text-center mx-[20px] w-full">
				<ZoomSlider 
					zoom={avatarData.zoom_level} 
					onChange={(newZoom) => setAvatarData((prev : AvatarData) => ({...prev, zoom_level: newZoom}))} />
			</div>
			<div className="mt-4 text-center p-4">
				<button className="bg-btn-primary p-[20px] w-auto rounded" onClick={handleSave}>Salvar Cambios</button>
			</div>
		</article>
	);
}
