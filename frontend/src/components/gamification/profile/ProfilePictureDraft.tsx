import Image from 'next/image';
import ZoomSlider from '../../../components/ui/ZoomSlider';

import { ProfileBorder } from '../../../types/gamification';
import { useState, useRef } from 'react';

function getProfileBorderStyle(profileBorder: ProfileBorder) {
	return {
		boxShadow: `inset 0 0 0 ${profileBorder.width}px ${profileBorder.color} , ${profileBorder.shadowColor} 0px 0px ${profileBorder.shadowWidth}px`,
		//boxShadow: `${profileBorder.shadowColor} 0px 0px ${profileBorder.shadowWidth}px`,
	}
}

function getProfilePictureStyle(zoomLevel: number, posX: number, posY: number) {
	return {
		transform: `scale(${zoomLevel})`, // For your zoom feature
		objectPosition: `${posX}px ${posY}px` // For your positioning feature
	}
}

interface ProfilePictureProps {
	profileBorder: ProfileBorder;
	profilePicture: string;
	onChange: (newBorder: ProfileBorder) => void;
}

export default function ProfilePictureDraft(props: ProfilePictureProps) {

	

	const {profileBorder, profilePicture, onChange} = props;
	// const fulImageWidth = 500;
	// const imageWidth = fulImageWidth - profileBorder.width * 2;
	const [ zoomLevel, setZoomLevel ] = useState(profileBorder.zoomLevel);

	const [pos, setPos] = useState({ x: profileBorder?.posX || 0, y: profileBorder?.posY || 0 });
	const [isDragging, setIsDragging] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);


	const profileBorderStyle = getProfileBorderStyle(profileBorder);
	const profilePictureStyle = getProfilePictureStyle(zoomLevel, pos.x, pos.y);

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDragging) return;
		
		// movementX/Y provides the delta since the last event
		setPos((prev) => ({
			x: prev.x + e.movementX/zoomLevel, // Adjust movement by zoom level for consistent panning
			y: prev.y + e.movementY/zoomLevel,
		}));
		
	}

	const saveChanges = () => {
		onChange({
			...profileBorder,
			zoomLevel,
			posX: pos.x,
			posY: pos.y,
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
					style={profileBorderStyle}
					onPointerDown={() => setIsDragging(true)}
					onPointerUp={() => setIsDragging(false)}
					onPointerLeave={() => setIsDragging(false)}
					onPointerMove={handlePointerMove}
				>
					{/* Image Container */}
					<div className="absolute inset-0 -z-10" 
						ref={containerRef}>
						<Image 
							src={profilePicture} 
							alt="profile picture" 
							fill
							className="object-cover pointer-events-none"
							style={profilePictureStyle}
							draggable={true}
						/>
					</div>
				</div>
			</div>
			<div className="mt-4 text-center mx-[20px] w-full">
				<ZoomSlider 
					zoom={zoomLevel} 
					onChange={setZoomLevel} />
			</div>
			<div className="mt-4 text-center p-4">
				<button className="bg-btn-primary p-[20px] w-auto rounded" onClick={saveChanges}>Salvar Cambios</button>
			</div>
		</article>
	);
}
