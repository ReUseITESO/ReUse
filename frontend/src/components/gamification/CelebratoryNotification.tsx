'use client';

import { useEffect, useState } from 'react';
import { X, Award, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface NotificationType {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
}

export function CelebratoryNotification({ notification, onClose }: { notification: NotificationType; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay for entry animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = async () => {
    setIsVisible(false);
    try {
      await apiClient(`/core/notifications/${notification.id}/mark_read/`, { method: 'PATCH' });
    } catch (e) {
      console.error('Error marking notification as read', e);
    }
    setTimeout(onClose, 300); // Wait for exit animation
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-[3px] shadow-2xl">
        <div className="relative flex items-start gap-4 rounded-xl bg-card p-4 pr-12">
          {/* Decorative background sparkles */}
          <div className="absolute -left-4 -top-4 text-yellow-500 opacity-20">
            <Sparkles className="h-24 w-24 animate-pulse" />
          </div>
          <div className="absolute -right-4 -bottom-4 text-yellow-500 opacity-20">
            <Sparkles className="h-24 w-24 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-800 shadow-inner">
            <Award className="h-7 w-7" />
          </div>
          
          <div className="z-10 flex flex-col justify-center">
            <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
              {notification.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-fg leading-relaxed">
              {notification.body}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-20 rounded-full p-1.5 text-muted-fg hover:bg-muted hover:text-fg transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
