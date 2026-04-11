import { useAvatar } from '@/hooks/profile/useAvatar';
import { AvatarData } from '@/types/gamification';
import { useState, useRef } from 'react';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';

function getProfileBorderStyle(avatarData: AvatarData) {
	return {
		backgroundColor: 'none',
		boxShadow: `inset 0 0 0 ${avatarData.border_thickness}px ${avatarData.border_color}, ${avatarData.shadow_color} 0px 0px ${avatarData.shadow_thickness}px`,
	}
}

function getProfilePictureStyle(avatarData: AvatarData) {
	return {
		position: 'absolute' as const,
        top: '50%',
        left: '50%',
		width: '100%',
    	height: '100%',
		objectFit: 'cover' as const,
		transform: `translate(calc(-50% + ${avatarData.offset_x}px), calc(-50% + ${avatarData.offset_y}px)) scale(${avatarData.zoom_level})`,
		pointerEvents: 'none' as const,
	}
}

interface MovableAvatarProps {
	movable?: boolean | null
}

export default function Avatar({movable = false}: MovableAvatarProps) {
	const { avatarData, setAvatarData } = useAvatar();
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const profileBorderStyle = getProfileBorderStyle(avatarData);
	const profilePictureStyle = getProfilePictureStyle(avatarData);

	const size_relative_to_container = 70

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDragging || !containerRef.current) return;

		// Retrieve live pixel dimensions
		const insideRec = containerRef.current.getBoundingClientRect();
		const rect = {
			width: insideRec.width / size_relative_to_container * 100,
			height: insideRec.height / size_relative_to_container * 100
		}
		const dpr = window.devicePixelRatio || 1;
		const zoom = avatarData.zoom_level

		// Remove the /zoom division if translate is the leftmost transform
		// Divide by dpr to align physical mouse movement with logical CSS pixels
		const deltaX = e.movementX / dpr;
		const deltaY = e.movementY / dpr;

		//console.log("offset X: ", Math.min(Math.max(avatarData.offset_x + deltaXPercent, 0), 100))
		setAvatarData(prev => {
			
			const newX = prev.offset_x + deltaX;
			const newY = prev.offset_y + deltaY;

			const limitX = (zoom >= 1) ? ((zoom - 1) * rect.width) : ((1 - zoom) * rect.width / zoom);
			const limitY = (zoom >= 1) ? ((zoom - 1) * rect.height): ((1 - zoom) * rect.width / zoom);

			return {
				...prev,
				offset_x: Math.max(-limitX, Math.min(limitX, newX)),
				offset_y: Math.max(-limitY, Math.min(limitY, newY))
			};
		});
		
	}

	const getContainerLayout = (size: number) => {
		const offset = (100 - size) / 2;
		return {
			top: `${offset}%`,
			left: `${offset}%`,
			width: `${size}%`,
			height: `${size}%`
		};
	};
	return (
		<div className="w-full h-full relative">

			{/* 1. The Movable Content Layer */}
			<div className="aspect-square absolute
				rounded-full overflow-hidden flex 
				items-center justify-center 
				touch-none select-none"	
				style={getContainerLayout(size_relative_to_container)}
				ref={containerRef}
				{...(movable ? {
					onPointerDown: (e) => {
						e.currentTarget.setPointerCapture(e.pointerId); // Better drag tracking
						setIsDragging(true);
					},
					onPointerUp: (e) => {
						e.currentTarget.releasePointerCapture(e.pointerId);
						setIsDragging(false);
					},
        			onPointerMove: handlePointerMove
				} : {})}
				>

				{/* Background */}
				<div className="overflow-hidden absolute
					h-full w-full"
					style={getContainerLayout(size_relative_to_container)}
				/>

				{/* The Image */}
				<div className="overflow-hidden rounded-full 
				absolute inset-0 h-full w-full"> 
					<Image 
						src={getImageUrl(avatarData.image)} 
						alt="profile picture" 
						fill
						className="object-cover pointer-events-none"
						style={profilePictureStyle}
						unoptimized
						draggable={false} // Change to false to prevent browser default ghosting
					/>
				</div>
			</div>

			{/* 2. The Custome Border Overlay Layer */}
			{(avatarData.border_type === "custom") && (
			<div 
				id="profile-border" 
				ref={containerRef} // Move the ref here
				className="absolute aspect-square 
				rounded-full flex inset-[15%]
				items-center justify-center
				pointer-events-none"
				style={{...profileBorderStyle}}
			>
			</div>)}

			{/* 3. The Design Border Overlay Layer */}	
			{(avatarData.border_type === "design" && avatarData.border_name) && (
				<div className="absolute aspect-square top-0 left-0 w-full
							flex items-center justify-center pointer-events-none">
					<div className="absolute inset-0 rounded-full pointer-events-none">
						<Image 
							src={getImageUrl(`/media/avatars/borders/${avatarData.border_name}.png`)}
							alt={avatarData.border_name || 'preset border'}
							fill
							className="object-contain p-1"	
							unoptimized
						/>
					</div>
				</div>
			)}
		</div>
	)
}
