'use client';

import { useEffect, useState } from 'react';
import { BadgeWithStatus } from '@/types/gamification';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { apiClient } from '@/lib/api'; // Use the team's custom API client

export default function BadgesList() {
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // apiClient automatically handles the base URL and auth headers
        const data = await apiClient<BadgeWithStatus[]>('/gamification/badges/status/');
        setBadges(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch achievements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      {badges.map((badge) => {
        const isLocked = !badge.earned_at;
        return (
          <Card key={badge.id} className={`p-4 flex flex-col items-center text-center transition-all ${isLocked ? 'opacity-50 grayscale' : 'hover:scale-105 shadow-md'}`}>
            <img 
              src={badge.icon_url || 'https://via.placeholder.com/64'} 
              alt={badge.name} 
              className="w-16 h-16 mb-3 rounded-full"
            />
            <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
            <p className="text-xs text-muted-fg mb-2">{badge.description}</p>
            
            {!isLocked ? (
              <span className="text-xs font-medium text-success">
                Obtenido: {new Date(badge.earned_at as string).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-xs font-medium text-muted-fg">
                Bloqueado
              </span>
            )}
          </Card>
        );
      })}
    </div>
  );
}