'use client';

import { useAuth } from '@/hooks/useAuth';
// import { set } from 'react-hook-form';

// import User from '@/types/auth';
import AvatarBorderEditor from '../../../components/gamification/profile/avatarEditor/AvatarBorderEditor';
import ProfilePicture from '../../../components/gamification/profile/ProfilePictureDraft';
import Loading from '@/components/fallbacks/Loading';
import AuthRequired from '@/components/fallbacks/AuthRequired';

import { ChevronLeft } from 'lucide-react'; // Or use a custom SVG for a literal triangle

export default function CustomizationPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) return <Loading />;

  if (!isAuthenticated || !user) return <AuthRequired />;

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Navigation: Relative positioning ensures it stays within the flow or container bounds */}
      <div className="w-full max-w-4xl flex justify-start mb-4">
        <a
          href="/profile"
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={32} />
        </a>
      </div>

      <div className="w-full max-w-4xl text-white flex flex-col items-center">
        <h1 className="mb-8 text-3xl md:text-5xl font-bold text-fg">Personaliza tu Avatar</h1>

        {/* Responsive Grid: 
					1 column on mobile (stacking)
					2 columns on medium screens and up
				*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch w-full">
          <div className="w-full bg-opacity-5 bg-white rounded-lg p-4">
            <ProfilePicture />
          </div>
          <div className="w-full bg-opacity-5 bg-white rounded-lg p-4">
            <AvatarBorderEditor />
          </div>
        </div>
      </div>
    </main>
  );
}
