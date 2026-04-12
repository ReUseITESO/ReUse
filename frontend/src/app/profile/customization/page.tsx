'use client';

import { useAuth } from '@/hooks/useAuth';
// import { set } from 'react-hook-form';

// import User from '@/types/auth';
import ProfileBorderEditor from '../../../components/gamification/profile/ProfileBorderEditor';
import ProfilePicture from '../../../components/gamification/profile/ProfilePictureDraft';
import Loading from '@/components/fallbacks/Loading';
import AuthRequired from '@/components/fallbacks/AuthRequired';

import { ChevronLeft } from 'lucide-react'; // Or use a custom SVG for a literal triangle

export default function CustomizationPage() {
	const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

	if (isAuthLoading) 
		return <Loading />;

	if (!isAuthenticated || !user) 
		return <AuthRequired />;


  	return (
		
		<main className="min-h-screen p-6flex-1 ">
			<a
				href="/profile"
				className="absolute top-20 left-4 z-50 flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors"
				aria-label="Go back"
				>
				<ChevronLeft size={32} />
			</a>
			<div className="mx-auto max-w-4xl 
						text-white ">
				<h1 className="mb-8 text-h1 font-bold text-fg">Customizar el Perfil</h1>

				<div className="w-[1200px] h-[900px] p-[10px] grid grid-cols-2 
						gap-4 place-items-center">
					<ProfilePicture/>
					<ProfileBorderEditor/>
				</div>				
			</div>
		</main>
	);
}