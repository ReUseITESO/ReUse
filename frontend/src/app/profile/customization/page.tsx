'use client';

import { useAuth } from '@/hooks/useAuth';
// import { set } from 'react-hook-form';

// import User from '@/types/auth';
import ProfileBorderEditor from '../../../components/gamification/profile/ProfileBorderEditor';
import ProfilePicture from '../../../components/gamification/profile/ProfilePictureDraft';
import Loading from '@/components/fallbacks/Loading';
import AuthRequired from '@/components/fallbacks/AuthRequired';

export default function CustomizationPage() {
	const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

	if (isAuthLoading) 
		return <Loading />;

	if (!isAuthenticated || !user) 
		return <AuthRequired />;


  	return (
		
		<main className="min-h-screen p-6flex-1 ">
			<div className="mx-auto max-w-4xl 
						text-white ">
				<h1 className="mb-8 text-h1 font-bold text-fg">Customizar el Perfil</h1>

				<div className="grid grid-cols-2 
						gap-4 place-items-center">
					<ProfilePicture/>
					<ProfileBorderEditor/>
				</div>				
			</div>
		</main>
	);
}