# Normas de Escritura – Frontend (Next.js + TypeScript)

## Propósito

Reglas obligatorias de estilo y escritura de código para el frontend de ReUseITESO. Todo PR que no cumpla estas normas será rechazado. Sin excepciones.

---

## 1. Reglas Generales

### Archivos

- **Máximo 350 líneas por archivo.** Si un componente supera este límite, se divide en componentes más pequeños.
- **Un archivo, un componente.** No exportar múltiples componentes desde un solo archivo.
- Archivos vacíos o con solo exports de barrel no se commitean sin contenido real.
- No se commitean `node_modules/`, `.next/`, `.env.local` ni archivos de build. Deben estar en `.gitignore`.

### Comentarios

- **No se escriben comentarios obvios.** El código con buenos nombres y tipos claros se explica solo.
- Si necesitas un comentario para explicar qué hace el código, reescribe el código.
- Los únicos comentarios aceptables son:
  - `// TODO:` con contexto específico
  - Explicación de un workaround o decisión no obvia
- **Prohibido:**
  ```tsx
  // Esto NO se hace:
  // Product card component
  const ProductCard = () => {
    // Get the product title
    const title = product.title;
    // Render the card
    return <div>{title}</div>;
  };
  ```

### Nombres

- Componentes y tipos: `PascalCase` → `ProductCard.tsx`, `UserProfile.tsx`
- Funciones, variables y hooks: `camelCase` → `useProducts`, `formatPrice`, `isLoading`
- Constantes: `UPPER_SNAKE_CASE` → `MAX_IMAGES`, `API_BASE_URL`
- Archivos de componentes: `PascalCase.tsx` → `ProductCard.tsx`
- Archivos de utilidades y hooks: `camelCase.ts` → `useAuth.ts`, `formatDate.ts`
- Todo en **inglés**. Sin spanglish.
  ```tsx
  // Bien
  const publishedProducts = products.filter(p => p.status === 'published');
  
  // Mal
  const productosPublicados = products.filter(p => p.status === 'published');
  const prods = products.filter(p => p.status === 'published');
  ```
- Booleans se nombran como pregunta: `isLoading`, `hasError`, `canEdit`.
- Event handlers usan prefijo `handle`: `handleSubmit`, `handleClick`, `handleStatusChange`.
- Props de callbacks usan prefijo `on`: `onSubmit`, `onClick`, `onStatusChange`.

### Emojis y decoración

- **Cero emojis** en código, comentarios o strings de UI (los textos de interfaz van en español normal).
- **Cero console.log** en código commiteado. Usar un logger si se necesita en producción.

---

## 2. Convenciones de TypeScript

### Tipado estricto

- `strict: true` en `tsconfig.json`. No se relaja.
- **Prohibido** usar `any`. Si no sabes el tipo, usa `unknown` y haz narrowing.
  ```tsx
  // Mal
  const data: any = await response.json();

  // Bien
  const data: ProductListResponse = await response.json();
  ```
- **Prohibido** usar `@ts-ignore` o `@ts-expect-error` sin justificación en el mismo comentario.
- Todas las props de componentes deben estar tipadas con `interface`.

### Interfaces y tipos

```tsx
interface ProductCardProps {
  product: Product;
  onStatusChange?: (status: ProductStatus) => void;
}

type ProductStatus = 'published' | 'reserved' | 'sold' | 'cancelled';
```

**Reglas:**
- Usar `interface` para props de componentes y objetos con estructura fija.
- Usar `type` para unions, intersections y aliases simples.
- Los tipos que reflejan respuestas del backend viven en `src/types/` y se nombran igual que el recurso: `product.ts`, `user.ts`, `transaction.ts`.
- No duplicar tipos. Si el backend retorna un `Product`, hay un solo `Product` type en el frontend.

### Enums

No usar `enum` de TypeScript. Usar union types o constantes:

```tsx
// Mal
enum Status {
  Published = 'published',
  Reserved = 'reserved',
}

// Bien
type ProductStatus = 'published' | 'reserved' | 'sold' | 'cancelled';

// También bien para cuando necesitas iterar
const PRODUCT_STATUSES = ['published', 'reserved', 'sold', 'cancelled'] as const;
type ProductStatus = typeof PRODUCT_STATUSES[number];
```

---

## 3. Convenciones de React y Next.js

### Estructura de componentes

```tsx
interface ProductCardProps {
  product: Product;
  onSelect: (id: number) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const formattedPrice = formatPrice(product.price);

  function handleClick() {
    onSelect(product.id);
  }

  return (
    <article onClick={handleClick}>
      <h3>{product.title}</h3>
      <span>{formattedPrice}</span>
    </article>
  );
}
```

**Reglas de componentes:**
- Componentes funcionales siempre. No usar class components.
- `export default` para el componente principal del archivo.
- Props destructuradas en los parámetros de la función.
- Interface de props justo arriba del componente, en el mismo archivo.
- Un componente hace UNA cosa. Si tiene más de 350 líneas o maneja más de una responsabilidad, se divide.

### Hooks

```tsx
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient<ProductListResponse>('/api/products/', { params: filters });
        setProducts(data.results);
      } catch (err) {
        setError('No se pudieron cargar los productos');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [filters]);

  return { products, isLoading, error };
}
```

**Reglas de hooks:**
- Hooks custom siempre empiezan con `use`.
- Un hook custom por archivo en `src/hooks/`.
- Los hooks manejan los 3 estados: datos, loading y error.
- No hacer fetch directo en componentes. Siempre a través de un hook o de `src/lib/api.ts`.

### Pages (App Router)

```tsx
// src/app/products/page.tsx
export default function ProductsPage() {
  return (
    <main>
      <h1>Productos disponibles</h1>
      <ProductList />
    </main>
  );
}
```

**Reglas de pages:**
- Las pages son simples: composición de componentes y layout.
- Cero lógica de negocio en pages.
- Cero fetch directo en pages (eso va en hooks o Server Components con async).
- Metadata (title, description) se define con `export const metadata` de Next.js.

### Server Components vs Client Components

- Por defecto, todo es **Server Component** (convención de Next.js App Router).
- Solo agregar `'use client'` cuando el componente necesite: `useState`, `useEffect`, event handlers, browser APIs.
- No poner `'use client'` en pages a menos que sea estrictamente necesario.
- Mover la interactividad al componente hijo más pequeño posible.

```tsx
// page.tsx → Server Component (no necesita 'use client')
export default function ProductsPage() {
  return (
    <main>
      <h1>Productos</h1>
      <ProductFilters />   {/* Este sí es 'use client' porque tiene estado */}
      <ProductList />
    </main>
  );
}
```

---

## 4. Convenciones de Estilos

### Tailwind CSS

- Se usa **Tailwind CSS** como sistema de estilos principal.
- No escribir CSS custom a menos que Tailwind no pueda resolver el caso.
- No usar `style={{}}` inline excepto para valores verdaderamente dinámicos (ej. posición calculada).
- Clases de Tailwind en un orden lógico: layout → spacing → sizing → typography → colors → effects.
  ```tsx
  // Orden lógico
  <div className="flex items-center gap-4 p-4 w-full text-sm text-gray-700 bg-white rounded-lg shadow-sm">

  // No hacer esto: clases en orden aleatorio
  <div className="shadow-sm text-sm flex bg-white p-4 rounded-lg w-full gap-4 items-center text-gray-700">
  ```
- Si una cadena de clases es muy larga (> 100 caracteres), usar `clsx` o `cn` para organizarla:
  ```tsx
  <div className={cn(
    'flex items-center gap-4 p-4',
    'text-sm text-gray-700',
    'bg-white rounded-lg shadow-sm',
    isActive && 'border-2 border-blue-500'
  )}>
  ```

---

## 5. Manejo de Estados de UI

Todo componente que consuma datos de la API debe manejar los 4 estados definidos en `contracts.md`:

```tsx
export default function ProductList() {
  const { products, isLoading, error } = useProducts();

  if (isLoading) {
    return <ProductListSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (products.length === 0) {
    return <EmptyState message="No hay productos publicados" />;
  }

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
```

**Prohibido:**
- Dejar una vista en blanco mientras carga.
- Mostrar un error genérico sin opción de reintentar.
- No manejar el caso de lista vacía.

---

## 6. Estructura del Proyecto

```
src/
├── app/                        # Pages (App Router)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── products/
│   │   ├── page.tsx            # Lista de productos
│   │   └── [id]/page.tsx       # Detalle de producto
│   ├── profile/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── EmptyState.tsx
│   │   └── Skeleton.tsx
│   ├── products/               # Componentes de dominio: productos
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   └── ProductFilters.tsx
│   ├── auth/                   # Componentes de dominio: auth
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── layout/                 # Layout global
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useGamification.ts
├── lib/
│   ├── api.ts                  # Cliente HTTP centralizado
│   ├── auth.ts                 # Manejo de tokens JWT
│   └── utils.ts                # Helpers puros (formatPrice, formatDate)
└── types/
    ├── product.ts
    ├── user.ts
    ├── transaction.ts
    ├── gamification.ts
    └── api.ts                  # Tipos genéricos de respuesta API
```

**Reglas:**
- No crear carpetas vacías "por si acaso".
- No crear archivos `index.ts` solo para re-exportar un solo componente.
- Componentes de dominio (products, auth) van en su carpeta dentro de `components/`.
- Componentes base reutilizables (Button, Input, Card) van en `components/ui/`.

---

## 7. Formato y Linting

### Herramientas obligatorias

- **ESLint** con configuración de Next.js (`next/core-web-vitals`).
- **Prettier** como formatter automático. No se discute estilo: Prettier decide.
- **TypeScript** en modo estricto.

### Configuración de Prettier (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### Reglas de ESLint adicionales

- No unused variables (error, no warning).
- No unused imports.
- No `console.log` (se permite `console.error` y `console.warn` con justificación).
- React hooks rules enforced (exhaustive-deps).

Estas herramientas se ejecutan en CI. Si el código no pasa ESLint + Prettier + TypeScript, el pipeline falla.

---

## 8. Imports

Orden obligatorio (ESLint lo puede enforzar):

```tsx
// 1. React / Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Librerías externas
import { clsx } from 'clsx';

// 3. Componentes internos
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';

// 4. Hooks internos
import { useProducts } from '@/hooks/useProducts';

// 5. Utilidades y tipos
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';
```

**Reglas:**
- Usar path alias `@/` para imports del proyecto (configurado en `tsconfig.json`).
- `import type` para imports que solo se usan como tipos.
- No usar imports relativos con `../../`. Siempre usar `@/`.