'use client';

import Image from 'next/image';
import { useState } from 'react';
import { set } from 'react-hook-form';
import Slider from '../../../components/ui/Slider';

type ProfileBorder = {
	width: number;
	color: string;
	shadowColor: string;
	shadowWidth: number;
};

const defaultProfileBorder = {
  width: 10,
  color: 'red',
  shadowColor: 'orange',
  shadowWidth: 20,
};

function ProfileBorderEditor(props) {
	const { profileBorder, onChange } = props;
	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 
							border border-primary/20 p-6 shadow-sm
							h-300">
			<div className="flex items-center justify-center">		
				<div className="flex flex-col gap-4 text-black">
					<input type="color" value={profileBorder.color} onChange={(e) => onChange({...profileBorder, color: e.target.value})}/>
					<Slider value={profileBorder.width} onChange={(value) => onChange({...profileBorder, width: value})} min={0} max={50}/>
					<input type="color" value={profileBorder.shadowColor} onChange={(e) => onChange({...profileBorder, shadowColor: e.target.value})}/>
					<Slider value={profileBorder.shadowWidth} onChange={(value) => onChange({...profileBorder, shadowWidth: value})} min={0} max={50}/>
				</div>
			</div>
		</article>
	)
}


function getProfileBorderStyle(profileBorder: ProfileBorder) {
	return {
		backgroundColor: profileBorder.color,
		width: `solid ${profileBorder.color} ${profileBorder.width}px`,
		boxShadow: `${profileBorder.shadowColor} 0px 0px ${profileBorder.shadowWidth}px`,
	}
}

function ProfilePicture(props) {
	const { profileBorder } = props;
	const profileBorderStyle = getProfileBorderStyle(profileBorder);
	const padding = profileBorder.width + profileBorder.shadowWidth;

	return (
		<article className="rounded-lg bg-gradient-to-br 
							from-primary/5 to-primary/15 border 
							border-primary/20 p-6 shadow-sm
							w-full h-full">
			<div className="flex items-center justify-center" style={{ padding: `${padding}px` }}>
				
				<div id="profile-border" style={profileBorderStyle} className="rounded-full">
					{<Image width="500" height="500" src="/images/profile.png" alt="profile picture" 
						className="rounded-full w-32 h-32 bg-white"/>}
				</div>
			</div>
		</article>
	);
}

export default function CustomizationPage() {
	const [profileBorder, setProfileBorder] = useState(defaultProfileBorder)

  	return (
		<main className="min-h-screen p-6flex-1 ">
			<div className="mx-auto max-w-4xl 
						text-white ">
				<h1 className="mb-8 text-h1 font-bold text-fg">Customizar el Perfil</h1>

				<div className="grid grid-cols-2 
						gap-4 place-items-center">
					<ProfilePicture profileBorder={profileBorder}/>
					<ProfileBorderEditor profileBorder={profileBorder}
						onChange={setProfileBorder}/>
				</div>				
			</div>
		</main>
	);
}