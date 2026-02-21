# Frontend - ReUseITESO

Frontend de ReUseITESO. Next.js 14 + TypeScript + Tailwind CSS.

## Estructura del Proyecto

```
src/
├── app/                        # Pages (App Router)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Componentes base (Button, Skeleton, etc.)
│   ├── products/               # Componentes de productos
│   ├── auth/                   # Componentes de login/registro
│   └── layout/                 # Header, Footer, Sidebar
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useGamification.ts
├── lib/
│   ├── api.ts                  # Cliente HTTP centralizado
│   ├── auth.ts                 # Manejo de tokens JWT
│   └── utils.ts                # Helpers (formatPrice, formatDate, cn)
└── types/
    ├── api.ts                  # Tipos genericos de respuesta API
    ├── product.ts
    ├── user.ts
    ├── transaction.ts
    └── gamification.ts
```

## Reglas de Organizacion

- **Pages (`app/`)**: solo composicion de componentes. Cero logica de negocio.
- **Components (`components/`)**: UI pura. Reciben datos por props.
- **Hooks (`hooks/`)**: encapsulan consumo de API y estado.
- **Lib (`lib/`)**: funciones utilitarias puras.
- **Types (`types/`)**: tipos TypeScript que reflejan los modelos del backend.

## Setup Local

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Variables de entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Correr en desarrollo

```bash
npm run dev
```

El servidor estara en `http://localhost:3000`

### 4. Build de produccion

```bash
npm run build
npm start
```

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (estilos)
- **React Hook Form** (formularios)
- **clsx** (utilidad para clases condicionales)

## Convenciones

- Componentes: `PascalCase.tsx`
- Hooks: `camelCase.ts` con prefijo `use`
- Tipos: `interface` para props, `type` para unions
- Imports con alias `@/` (no relativos con `../../`)
- Prettier + ESLint obligatorios
- Todo en ingles excepto textos de UI (que van en espanol)
- Siempre manejar los 4 estados: Loading, Success, Empty, Error

Ver reglas completas en `reglas_de_escritura_front.md`
