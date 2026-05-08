'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const ERROR_MESSAGES = [
  { title: 'System Error', body: 'Stack overflow en sistema_inmunologico.exe' },
  { title: 'Windows', body: 'Windows encontro un problema. Y tu novia tambien.' },
  { title: 'Internet Explorer', body: 'No se puede mostrar la pagina. Igual que tus calificaciones.' },
  { title: 'Antivirus', body: 'Virus detectado: ferreira.dog (severidad: te la mete)' },
  { title: 'Update', body: 'Tu PC se reinicia en 3s. Tu vida tambien deberia.' },
  { title: 'Error', body: 'Demasiados errores. Igual que tu ex.' },
  { title: 'Memoria insuficiente', body: 'Cierra Chrome. Si, las 47 pestañas. Si las del incognito tambien.' },
  { title: 'Disco lleno', body: 'Espacio: -3 GB. Como tu autoestima.' },
  { title: 'Microsoft Office', body: 'Pagame la suscripcion o se lo cuento a tu mama.' },
  { title: 'Norton', body: 'Renueva la licencia, o renueva tu vida.' },
  { title: 'Skype', body: 'Tu jefe te llamo 17 veces. Tu mama 47.' },
  { title: 'WinRAR', body: 'Trial expiro hace 8 años. Como la promesa de bañarte.' },
  { title: 'Cookies', body: 'Aceptar todas? (no hay otra opcion, igual que con tu suegra)' },
  { title: 'Windows XP', body: 'Operation completed successfully. Pero tu no.' },
  { title: 'Hardware', body: 'Tu mouse renuncio. Tu pareja tambien.' },
  { title: 'Network', body: 'Cable desconectado. Tus suscripciones tambien.' },
  { title: 'Driver', body: 'GPU no detectada. Tampoco tu sazon.' },
  { title: 'Print', body: 'Atasco de papel. Como tu cerebro en programacion 1.' },
  { title: 'Virus', body: 'Troyano "miembrosito.exe" se instalo. Es chiquito pero pica.' },
  { title: 'Backup', body: 'Tu backup se corrompio. Tus secretos tambien.' },
  { title: 'Email', body: '247 correos sin leer del SAT. Pero tranqui.' },
  { title: 'Calendar', body: 'Recordatorio: nadie se acuerda de tu cumple.' },
  { title: 'Spotify', body: 'Tu mix tiene 90% reggaeton. Confirmamos sospechas.' },
  { title: 'Battery', body: 'Bateria 1%. Igual de baja que tu vibra.' },
  { title: 'Bluetooth', body: 'Dispositivo conectado: ferreira_perro_v2.0' },
  { title: 'WiFi', body: 'Red WiFi cambiada a "te_estoy_viendo"' },
  { title: 'Webcam', body: 'Camara activada por terceros. Sonrie panzon.' },
  { title: 'Mic', body: 'Microfono escuchando. Te oimos roncar.' },
  { title: 'Recovery', body: 'Modo recuperacion: no hay nada que recuperar de tu vida.' },
  { title: 'Defrag', body: 'Defragmentando... 0% completado. Como tu carrera.' },
  { title: 'Discord', body: 'Estas mute en el server desde 2019. Nadie te dijo nada.' },
  { title: 'Facebook', body: 'Tu tia subio otra cadena. Y otra.' },
  { title: 'Photos', body: 'Encontramos esa foto del 2014. La compartimos en grupal.' },
  { title: 'Browser', body: 'Tu historial filtrado a familiares. Suerte cabron.' },
  { title: 'Adobe', body: 'Tu suscripcion expiro en 2017. Como tu virginidad.' },
  { title: 'Steam', body: 'CS:GO instalado: 2840 horas. Rank: silver. Lol.' },
  { title: 'TikTok', body: 'Algoritmo cambiado a contenido de señoras de 60.' },
  { title: 'iCloud', body: 'Espacio lleno. Tienes 12,847 selfies del mismo angulo.' },
  { title: 'OnlyFans', body: 'Suscripcion detectada. Pago con tarjeta de tu mama.' },
  { title: 'Tinder', body: '0 matches en 6 meses. El algoritmo te ignora.' },
  { title: 'Mac', body: 'Tu Mac es Windows ahora. Bienvenido al lado pobre.' },
  { title: 'Linux', body: 'Arch instalado en /. Ahora si te la creiste.' },
  { title: 'Git', body: 'fatal: refusing to merge unrelated lives' },
  { title: 'npm', body: '47 vulnerabilidades criticas. Tu vida 47 tambien.' },
  { title: 'Visa', body: 'Tarjeta declinada. Igual que tu propuesta.' },
  { title: 'Banco', body: 'Saldo: $-2,847. SAT te busca panzon.' },
  { title: 'Uber', body: 'Conductor: ferreira_perro. Rating: 1 estrella.' },
  { title: 'Rappi', body: 'Tu pedido cancelado. El repartidor te conocio.' },
  { title: 'Netflix', body: 'Acaban de quitar tu serie favorita por baja audiencia.' },
  { title: 'YouTube', body: 'Te suscribiste sin querer a 47 canales de motivacion.' },
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
  const idRef = useRef(0);
  const cancelledRef = useRef(false);
  const triggeredRef = useRef(false);

  const goToHacked = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    cancelledRef.current = true;
    router.push('/hacked');
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    cancelledRef.current = false;
    triggeredRef.current = false;

    const spawn = () => {
      if (cancelledRef.current) return;
      const msg = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
      const id = idRef.current++;
      setPopups((prev) => [
        ...prev,
        {
          id,
          message: msg,
          top: Math.random() * 75 + 2,
          left: Math.random() * 75 + 2,
          rotate: (Math.random() - 0.5) * 8,
          zIndex: 10000 + id,
        },
      ]);
      setTimeout(spawn, 90 + Math.random() * 60);
    };
    spawn();

    let beepCount = 0;
    let ctx: AudioContext | null = null;
    try {
      ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const beep = () => {
        if (cancelledRef.current || beepCount > 30 || !ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600 + Math.random() * 800;
        osc.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
        gain.gain.value = 0.035;
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
        beepCount += 1;
        setTimeout(beep, 250 + Math.random() * 200);
      };
      beep();
    } catch {
      // browser blocked autoplay; silent
    }

    return () => {
      cancelledRef.current = true;
      if (ctx) ctx.close().catch(() => {});
    };
  }, []);

  return (
    <div
      onClick={goToHacked}
      onPointerDown={goToHacked}
      className="fixed inset-0 z-[9999] cursor-pointer overflow-hidden bg-black/40 backdrop-blur-[2px]"
    >
      {popups.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute w-72 select-none border-2 border-[#0a4dcc] bg-[#ece9d8] font-mono shadow-2xl"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            transform: `rotate(${p.rotate}deg)`,
            zIndex: p.zIndex,
            animation: 'easter-popup-in 160ms ease-out',
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
              className="border border-[#7f7f7f] bg-[#d4d0c8] px-3 py-0.5 text-xs text-black"
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
