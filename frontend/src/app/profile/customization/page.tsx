'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
// import { set } from 'react-hook-form';

// import User from '@/types/auth';
import ProfileBorderEditor from '../../../components/gamification/profile/ProfileBorderEditor';
import ProfilePicture from '../../../components/gamification/profile/ProfilePictureDraft';

const defaultProfileBorder = {
  width: 10,
  color: 'red',
  shadowColor: 'orange',
  shadowWidth: 20,
  zoomLevel: 1,
  posX: 50,
  posY: 50,
};

export default function CustomizationPage() {
	const [profileBorder, setProfileBorder] = useState(defaultProfileBorder)
  	const { user, isAuthenticated, isLoading } = useAuth();
	
	if (isLoading) {
		return (
		<main className="min-h-screen p-6">
			<div className="mx-auto max-w-4xl">
			<div className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
			</div>
		</main>
			);
	}

	if (!isAuthenticated || !user) {
		return (
		<main className="min-h-screen p-6">
			<div className="mx-auto max-w-4xl">
			<div className="rounded-lg border border-warning/20 bg-warning/5 p-6 text-center">
				<p className="font-medium text-fg">Inicia sesion para ver tu perfil</p>
			</div>
			</div>
		</main>
		);
	}

	const displayUrl = user.profile_picture? user.profile_picture.replace('localhost', 'backend') : '/images/profile.png';
  	return (
		
		<main className="min-h-screen p-6flex-1 ">
			<div className="mx-auto max-w-4xl 
						text-white ">
				<h1 className="mb-8 text-h1 font-bold text-fg">Customizar el Perfil</h1>

				<div className="grid grid-cols-2 
						gap-4 place-items-center">
					<ProfilePicture profileBorder={profileBorder}
						profilePicture={displayUrl}
						onChange={setProfileBorder}/>
					<ProfileBorderEditor profileBorder={profileBorder}
						onChange={setProfileBorder}/>
				</div>				
			</div>
		</main>
	);
}