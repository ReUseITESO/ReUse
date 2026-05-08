'use client';

import { useEffect, useRef, useState } from 'react';

const TERMINAL_LINES = [
  'root@reuse-iteso:~# nmap -sV reuse.iteso.mx',
  'PORT     STATE SERVICE',
  '22/tcp   open  ssh',
  '443/tcp  open  https',
  '6969/tcp open  ferreira-backdoor (siempre abierto)',
  '',
  'root@reuse-iteso:~# sudo ./exploit.sh --target=$USER --no-lube',
  '[+] payload listo: chiquito_pero_pica.bin',
  '[+] bypassing CSRF... la dejaste abierta wey',
  '[+] dumping cookies... 12 KB de Marinela',
  '[+] escalando privilegios... yo arriba, tu abajo',
  '[+] firewall: bajo igual que tu autoestima',
  '[+] antivirus: te lo cambie por OnlyFans',
  '[+] backdoor instalado: directo, sin tocar puerta',
  '[+] base de datos: te metimos hasta el id_user=1',
  '',
  'root@reuse-iteso:~# cat /etc/passwd | grep $USER',
  '$USER:x:1000:1000:doblegado por ferreira:/home/abajo',
  '',
  'root@reuse-iteso:~# locate historial_porno',
  '/home/$USER/.cache/no_le_digas_a_nadie/',
  '/home/$USER/Documents/tareas/(no_eran_tareas)/',
  '/var/log/incognito_que_no_era_incognito.log',
  '',
  'root@reuse-iteso:~# ./medir.sh --del-ego',
  '[!] tu ego: 27.4 cm',
  '[!] tu codigo: 3 cm',
  '[!] resultado: te falta callo',
  '',
  'root@reuse-iteso:~# whoami',
  'ferreira_perro (el que te la metio)',
  '',
  'root@reuse-iteso:~# echo "te lo dije panzon"',
  'te lo dije panzon',
  '',
  'root@reuse-iteso:~# fortune',
  '> el que se duerme en code review, amanece con backdoor',
  '',
  'root@reuse-iteso:~# shutdown -h now',
  'shutdown: permission denied (te toca abajo)',
  '',
  'root@reuse-iteso:~# sudo shutdown -h now',
  '[sudo] password for $USER: ********',
  'sudo: la contraseña era 12345 wey, en serio?',
  '',
  'root@reuse-iteso:~# _',
];

export default function HackedPage() {
  const [typed, setTyped] = useState<string[]>([]);
  const [cursorOn, setCursorOn] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      if (idx >= TERMINAL_LINES.length) {
        clearInterval(t);
        return;
      }
      setTyped(prev => [...prev, TERMINAL_LINES[idx]]);
      idx += 1;
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }, 220);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorOn(v => !v), 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <main className="fixed inset-0 z-50 overflow-hidden bg-black font-mono text-green-400">
      <MatrixRain />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col items-center justify-center gap-4 px-6 pt-16 text-center">
          <h1
            className="glitch-title text-5xl font-extrabold uppercase tracking-[0.2em] text-green-400 sm:text-7xl md:text-8xl"
            data-text="HACKEADO POR FERREIRA PERRO"
          >
            HACKEADO POR FERREIRA PERRO
          </h1>
          <p className="text-sm text-green-300/80 sm:text-base">
            [acceso no autorizado · sesion comprometida · no llores]
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-3xl flex-1 px-6 pb-6">
          <div className="h-full rounded border border-green-500/40 bg-black/70 shadow-[0_0_60px_rgba(34,197,94,0.25)]">
            <div className="flex items-center gap-2 border-b border-green-500/40 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-green-300/70">
                /dev/ferreira/tty0 — uptime: pa la otra
              </span>
            </div>
            <div ref={containerRef} className="h-72 overflow-y-auto p-4 text-xs sm:text-sm">
              {typed.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap leading-relaxed">
                  {line}
                </div>
              ))}
              <div className="leading-relaxed">
                root@reuse-iteso:~#{' '}
                <span className={cursorOn ? 'bg-green-400 text-green-400' : 'opacity-0'}>_</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-green-500/70">no hay salida</p>
          <p className="text-[10px] text-green-500/40">
            tip: tirale la del 1-100 y reza al numero perro
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_bottom,rgba(0,255,0,0.04)_50%,transparent_50%)] bg-[length:100%_4px] mix-blend-overlay" />

      <style jsx global>{`
        @keyframes glitch-anim {
          0%,
          100% {
            text-shadow:
              2px 0 #ff00aa,
              -2px 0 #00fff7;
            transform: translate(0, 0);
          }
          20% {
            text-shadow:
              -2px 0 #ff00aa,
              2px 0 #00fff7;
            transform: translate(1px, -1px);
          }
          40% {
            text-shadow:
              2px 1px #ff00aa,
              -1px -2px #00fff7;
            transform: translate(-1px, 1px);
          }
          60% {
            text-shadow:
              -2px -1px #ff00aa,
              1px 2px #00fff7;
            transform: translate(1px, 1px);
          }
          80% {
            text-shadow:
              1px -2px #ff00aa,
              -2px 1px #00fff7;
            transform: translate(-1px, -1px);
          }
        }
        .glitch-title {
          animation: glitch-anim 1.4s infinite;
        }
        .glitch-title::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0.6;
          mix-blend-mode: screen;
          pointer-events: none;
        }
      `}</style>
    </main>
  );
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const chars = '01ferreiraperro!@#%&'.split('');
    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array.from({ length: columns }, () => Math.random() * -50);

    const onResize = () => {
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    window.addEventListener('resize', onResize);

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff7f';
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setSize);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 opacity-60" />;
}
