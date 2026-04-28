import { useAvatar } from '@/hooks/profile/useAvatar';
import { AvatarData } from '@/types/gamification';
import { useState, useRef, useLayoutEffect } from 'react';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';

function getProfileBorderStyle(avatarData: AvatarData, containerSize: number = 70) {
  return {
    backgroundColor: 'none',
    boxShadow: `inset 0 0 0 ${(avatarData.border_thickness * containerSize) / 100}px ${avatarData.border_color}, ${avatarData.shadow_color} 0px 0px ${(avatarData.shadow_thickness * containerSize) / 100}px`,
  };
}

function getProfilePictureStyle(avatarData: AvatarData) {
  return {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transform: `translate(calc(-50% + ${avatarData.offset_x}%), calc(-50% + ${avatarData.offset_y}%)) scale(${avatarData.zoom_level})`,
    pointerEvents: 'none' as const,
  };
}

interface MovableAvatarProps {
  movable?: boolean | null; 
}

export default function Avatar({ movable = false }: MovableAvatarProps) {
  const { avatarData, setAvatarData } = useAvatar();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  // Monitor size for responsive border calculation
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDims({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const profileBorderStyle = getProfileBorderStyle(avatarData, dims.width);
  const profilePictureStyle = getProfilePictureStyle(avatarData);

  // Single source of truth for proportions
  const AVATAR_SIZE_PERCENT = 80;

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !wrapperRef.current) return;

    // Retrieve live pixel dimensions
    const insideRec = wrapperRef.current.getBoundingClientRect();

    const rect = {
      width: insideRec.width,
      height: insideRec.height,
    };

    const dpr = window.devicePixelRatio || 1;
    const zoom = avatarData.zoom_level;

    // Remove the /zoom division if translate is the leftmost transform
    // Divide by dpr to align physical mouse movement with logical CSS pixels
    const deltaX = e.movementX / dpr;
    const deltaY = e.movementY / dpr;

    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;

    setAvatarData(prev => {
      const newX = prev.offset_x + deltaXPercent;
      const newY = prev.offset_y + deltaYPercent;

      const limitX = zoom >= 1 ? (zoom * rect.width) / 2 : rect.width / 2;
      const limitY = zoom >= 1 ? (zoom * rect.height) / 2 : rect.height / 2;

      return {
        ...prev,
        offset_x: Math.max(-limitX, Math.min(limitX, newX)),
        offset_y: Math.max(-limitY, Math.min(limitY, newY)),
      };
    });
  };

  const getContainerLayout = (size: number) => {
    const offset = (100 - size) / 2;
    return {
      top: `${offset}%`,
      left: `${offset}%`,
      width: `${size}%`,
      height: `${size}%`,
    };
  };
  return (
    <div className="w-full h-full relative" ref={wrapperRef}>
      {/* 1. The Movable Content Layer */}
      <div
        className="aspect-square absolute
				rounded-full overflow-hidden flex 
				items-center justify-center 
				touch-none select-none"
        style={getContainerLayout(AVATAR_SIZE_PERCENT)}
        {...(movable
          ? {
              onPointerDown: e => {
                e.currentTarget.setPointerCapture(e.pointerId); // Better drag tracking
                setIsDragging(true);
              },
              onPointerUp: e => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                setIsDragging(false);
              },
              onPointerMove: handlePointerMove,
            }
          : {})}
      >
        {/* Background */}
        <div
          className="overflow-hidden absolute
					h-full w-full"
          style={getContainerLayout(AVATAR_SIZE_PERCENT)}
        />

        {/* The Image */}
        <div
          className="overflow-hidden rounded-full 
				absolute inset-0 h-full w-full"
        >
          <Image
            src={getImageUrl(avatarData.image)}
            alt="profile picture"
            fill
            className="object-cover pointer-events-none"
            style={profilePictureStyle}
            unoptimized
            draggable={false} // Change to false to prevent browser default ghosting
          />
        </div>
      </div>

      {/* 2. The Custom Border Overlay Layer */}
      {avatarData.border_type === 'custom' && (
        <div
          id="profile-border"
          className="absolute aspect-square 
            rounded-full flex inset-[10%]
            items-center justify-center
            pointer-events-none"
          style={{ ...profileBorderStyle }}
        ></div>
      )}

      {/* 3. The Design Border Overlay Layer */}
      {avatarData.border_type === 'design' && avatarData.border_name && (
        <div
          className="absolute aspect-square w-full
							flex items-center justify-center 
              pointer-events-none"
        >
          <div className="absolute inset-0 rounded-full">
            <Image
              src={getImageUrl(`/media/avatars/borders/${avatarData.border_name}.png`)}
              alt={avatarData.border_name || 'preset border'}
              fill
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
