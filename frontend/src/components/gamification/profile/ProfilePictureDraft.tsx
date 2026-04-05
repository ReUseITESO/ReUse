import Image from 'next/image';

import { ProfileBorder } from '../../../types/gamification';

function getProfileBorderStyle(profileBorder: ProfileBorder) {
	return {
		boxShadow: `inset 0 0 0 ${profileBorder.width}px ${profileBorder.color} , ${profileBorder.shadowColor} 0px 0px ${profileBorder.shadowWidth}px`,
		//boxShadow: `${profileBorder.shadowColor} 0px 0px ${profileBorder.shadowWidth}px`,
	}
}

function getProfilePictureStyle(profileBorder: ProfileBorder) {
	return {
		transform: `scale(${profileBorder.zoomLevel})`, // For your zoom feature
		objectPosition: `${profileBorder.posX}% ${profileBorder.posY}%` // For your positioning feature
	}
}

interface ProfilePictureProps {
	profileBorder: ProfileBorder;
	profilePicture: string;
}

export default function ProfilePictureDraft(props: ProfilePictureProps) {
	const {profileBorder, profilePicture} = props;
	const profileBorderStyle = getProfileBorderStyle(profileBorder);
	const profilePictureStyle = getProfilePictureStyle(profileBorder);
	// const fulImageWidth = 500;
	// const imageWidth = fulImageWidth - profileBorder.width * 2;

	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 border 
							border-primary/20 p-6 shadow-sm
							w-full h-full">
								
			<div className="flex items-center justify-center w-full h-full">
				{/* Profile Border Container */}
				<div 
					id="profile-border" 
					className="relative h-[400px] w-[400px] rounded-full overflow-hidden flex items-center justify-center"
					style={profileBorderStyle}
				>
					{/* Image Container */}
					<div className="absolute inset-0 -z-10">
						<Image 
							src={profilePicture} 
							alt="profile picture" 
							fill
							className="object-cover"
							style={profilePictureStyle}
						/>
					</div>
				</div>
			</div>
		</article>
	);
}
