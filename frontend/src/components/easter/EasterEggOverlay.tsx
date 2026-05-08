'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ERROR_MESSAGES = [
  { title: 'System Error', body: 'Critical error: Stack overflow in heart.exe' },
  { title: 'Windows', body: 'Windows ha encontrado un problema y necesita cerrarse.' },
  { title: 'Internet Explorer', body: 'No se puede mostrar la página. ¿Reintentar 47 veces?' },
  { title: 'Antivirus', body: 'Virus detectado: ferreira.dog (gravedad: maximo perro)' },
  { title: 'Update', body: 'Tu PC se reiniciara en 3 segundos. No se puede cancelar.' },
  { title: 'Error', body: 'Demasiados errores. Cierra algunos errores antes de continuar.' },
  { title: 'Memoria insuficiente', body: 'Cierra Chrome. Si, todas las pestañas. SI TODAS.' },
  { title: 'Disco lleno', body: 'Espacio en disco: -3 GB. ¿Como? Buena pregunta.' },
  { title: 'Microsoft Office', body: '¿Quieres pagar la suscripcion?' },
  { title: 'Norton', body: 'Renueva tu licencia o tu mama se va a enterar.' },
  { title: 'Skype', body: 'Tu jefe te llamo 17 veces.' },
  { title: 'WinRAR', body: 'Tu prueba de 40 dias expiro hace 8 años.' },
  { title: 'Cookies', body: 'Aceptar todas? (no hay otra opcion)' },
  { title: 'Windows XP', body: 'Operation completed successfully. There must be something wrong.' },
  { title: 'Hardware', body: 'Tu mouse acaba de renunciar. Buena suerte.' },
  { title: 'Network', body: 'Cable de red desconectado. (No tienes cable de red)' },
];

interface PopupConfig {
  id: number;
  message: (typeof ERROR_MESSAGES)[number];
  top: number;
  left: number;
  rotate: number;
  zIndex: number;
}

export default function EasterEggOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [popups, setPopups] = useState<PopupConfig[]>([]);
  const [audioRefused, setAudioRefused] = useState(false);

  useEffect(() => {
    const total = ERROR_MESSAGES.length;
    let cancelled = false;

    const spawn = (index: number) => {
      if (cancelled || index >= total) return;
      const msg = ERROR_MESSAGES[index];
      setPopups((prev) => [
        ...prev,
        {
          id: index,
          message: msg,
          top: Math.random() * 60 + 5,
          left: Math.random() * 65 + 5,
          rotate: (Math.random() - 0.5) * 6,
          zIndex: 10000 + index,
        },
      ]);
      setTimeout(() => spawn(index + 1), 220);
    };

    spawn(0);

    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      let beepCount = 0;
      const beep = () => {
        if (cancelled || beepCount > 8) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880 + Math.random() * 400;
        osc.type = 'square';
        gain.gain.value = 0.04;
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        beepCount += 1;
        setTimeout(beep, 350);
      };
      beep();
    } catch {
      setAudioRefused(true);
    }

    const redirect = setTimeout(() => {
      if (cancelled) return;
      router.push('/hacked');
      onClose();
    }, total * 220 + 1200);

    return () => {
      cancelled = true;
      clearTimeout(redirect);
    };
  }, [router, onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-black/40 backdrop-blur-[2px]"
      aria-hidden={audioRefused ? 'true' : undefined}
    >
      {popups.map((p) => (
        <div
          key={p.id}
          className="absolute w-72 select-none border-2 border-[#0a4dcc] bg-[#ece9d8] font-mono shadow-2xl"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            transform: `rotate(${p.rotate}deg)`,
            zIndex: p.zIndex,
            animation: 'easter-popup-in 180ms ease-out',
          }}
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0a4dcc] to-[#3879d9] px-2 py-1 text-white">
            <span className="text-xs font-bold">{p.message.title}</span>
            <span className="flex h-4 w-4 items-center justify-center border border-white bg-[#d4d0c8] text-[10px] font-bold leading-none text-black">
              x
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 text-sm text-black">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-base font-bold text-white">
              x
            </div>
            <p className="text-xs leading-snug">{p.message.body}</p>
          </div>
          <div className="flex justify-end gap-1 border-t border-[#aca899] bg-[#ece9d8] p-2">
            <button
              type="button"
              className="border border-[#7f7f7f] bg-[#d4d0c8] px-3 py-0.5 text-xs text-black active:translate-y-px"
            >
              OK
            </button>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes easter-popup-in {
          from {
            transform: scale(0.6) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
