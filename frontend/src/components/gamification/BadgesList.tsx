'use client';

import { useEffect, useState } from 'react';
import { BadgeWithStatus } from '@/types/gamification';

import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { apiClient } from '@/lib/api'; 
import { Trophy, Star, Sprout, Handshake, ShieldCheck, HeartPulse, BookOpen, Crown, Gem, Rocket, Medal } from 'lucide-react';

export default function BadgesList() {
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await apiClient<BadgeWithStatus[]>('/gamification/badges/status/');
        setBadges(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Fallo al obtener los logros. Vuelve a intentarlo mas tarde.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const getIconForBadge = (badgeName: string) => {
    const name = badgeName.toLowerCase();
    if (name.includes('venta') || name.includes('comercio')) return <Rocket className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('comprador') || name.includes('estrella')) return <Star className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('eco') || name.includes('ambiente')) return <Sprout className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('trueque') || name.includes('intercambio')) return <Handshake className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('bienvenido') || name.includes('inicial')) return <ShieldCheck className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('top') || name.includes('rey')) return <Crown className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('libro')) return <BookOpen className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('perfil')) return <Gem className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('novato')) return <HeartPulse className="w-8 h-8 text-white relative z-10" />;
    return <Trophy className="w-8 h-8 text-white relative z-10" />;
  };

  const getGradientForBadge = (badgeName: string) => {
    const name = badgeName.toLowerCase();
    if (name.includes('eco')) return 'from-emerald-400 to-green-600';
    if (name.includes('top')) return 'from-amber-400 to-orange-500';
    if (name.includes('trueque')) return 'from-violet-400 to-fuchsia-600';
    if (name.includes('bienvenido')) return 'from-blue-400 to-cyan-500';
    if (name.includes('libro')) return 'from-rose-400 to-pink-600';
    if (name.includes('estrella')) return 'from-yellow-300 to-amber-500';
    if (name.includes('venta')) return 'from-red-400 to-rose-600';
    if (name.includes('perfil')) return 'from-sky-400 to-indigo-500';
    if (name.includes('novato')) return 'from-lime-400 to-green-500';
    return 'from-blue-500 to-indigo-600';
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {badges.map(badge => {
        const isLocked = !badge.earned_at;
        const gradient = getGradientForBadge(badge.name);
        
        return (
          <div
            key={badge.id}
            className={`
              relative group flex flex-col items-center p-5 text-center
              rounded-2xl border transition-all duration-500 ease-out h-full
              ${isLocked 
                ? 'border-border/60 bg-muted/20 opacity-60 hover:opacity-100 grayscale hover:grayscale-0' 
                : 'border-primary/20 bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-2'
              }
            `}
          >
            {/* Sparkle effects for unlocked */}
            {!isLocked && (
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl rounded-full bg-gradient-to-tr from-primary to-accent pointer-events-none z-0" />
              </div>
            )}

            {/* Icon Container */}
            <div className={`
              relative flex items-center justify-center w-20 h-20 mb-4 rounded-3xl 
              transition-transform duration-500 group-hover:scale-110 shadow-lg
              bg-gradient-to-br ${isLocked ? 'from-slate-300 to-slate-400' : gradient}
            `}>
              <div className="absolute inset-0 bg-white/20 rounded-3xl backdrop-blur-sm z-0" />
              {getIconForBadge(badge.name)}
              
              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-background/50 rounded-3xl z-20 flex items-center justify-center backdrop-blur-[1px]">
                  <Medal className="w-8 h-8 text-muted-fg/80" />
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="relative z-10 flex flex-col flex-1 w-full mt-2">
              <h3 className={`font-bold text-[15px] mb-2 leading-tight ${!isLocked ? 'bg-clip-text text-transparent bg-gradient-to-r ' + gradient : 'text-muted-fg'}`}>
                {badge.name}
              </h3>
              <p className="text-[13px] text-muted-fg mb-4 flex-1 line-clamp-3 leading-relaxed">
                {badge.description}
              </p>
              
              <div className="mt-auto w-full pt-3 border-t border-border/50">
                {!isLocked ? (
                  <div className="inline-flex items-center justify-center gap-1.5 w-full bg-success/10 py-1.5 px-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[11px] font-bold text-success/90 uppercase tracking-widest">
                      {new Date(badge.earned_at as string).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-full py-1.5 bg-muted/50 rounded-lg">
                    <span className="text-[11px] font-semibold text-muted-fg uppercase tracking-widest">Bloqueado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
