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

### Variables Globales de Color y Tipografía

Los colores, tipografía y variantes de botones están centralizados en dos archivos. **No existe otra fuente de verdad.**

- `src/app/globals.css` — define las variables CSS en `:root` (light) y `.dark`
- `tailwind.config.js` — mapea cada variable a una clase utilitaria de Tailwind

**Regla obligatoria:** Nunca hardcodear colores en componentes.

```tsx
// MAL – color hardcodeado
<button className="bg-[#004976] text-white">Publicar</button>
<div style={{ color: '#155DFC' }}>Texto</div>
<div className="text-blue-700">Texto</div>   {/* color nativo Tailwind */}

// BIEN – usando variables globales
<button className="bg-btn-primary text-btn-primary-fg">Publicar</button>
<div className="text-secondary">Texto</div>
```

#### Por qué los colores están en formato HSL (y no hex)

Los colores en `globals.css` están definidos como **valores HSL sin wrapper** (p. ej. `203 100% 23%`), no como hex (`#004976`). Esto es obligatorio para que Tailwind pueda aplicar modificadores de opacidad con la sintaxis barra (`/`).

**Cómo funciona internamente:**

Cuando Tailwind ve `bg-primary/10`, necesita inyectar el canal alpha en la declaración CSS. Para lograrlo, en `tailwind.config.js` cada color se mapea con el placeholder `<alpha-value>`:

```js
// tailwind.config.js
primary: 'hsl(var(--primary) / <alpha-value>)'
```

Tailwind reemplaza `<alpha-value>` por el número de la barra dividido entre 100:
- `bg-primary` → `hsl(var(--primary) / 1)` (100% opaco)
- `bg-primary/10` → `hsl(var(--primary) / 0.1)` (10% opaco)
- `bg-primary/30` → `hsl(var(--primary) / 0.3)` (30% opaco)

**Por qué hex no funciona:**

Con hex, el CSS generado sería `rgb(#004976 / 0.1)`, que es inválido. Con HSL (valores sueltos `H S% L%`), el CSS generado es `hsl(203 100% 23% / 0.1)`, que es perfectamente válido en CSS moderno.

**Escala de opacidad `/N`:**

```
/10  →  10% opaco  → fondo muy suave (ideal para badges)
/20  →  20% opaco
/30  →  30% opaco  → borde sutil (ideal para bordes de badges)
/50  →  50% opaco  → semitransparente
/100 → 100% opaco  → color sólido (equivale a no poner barra)
```

Cuanto más bajo el número, más transparente. Los badges de este proyecto usan el patrón `bg-{color}/10 text-{color} border border-{color}/30` precisamente por esto.

#### Tipografía

| Nivel | Clase Tailwind | Variable CSS | Tamaño |
|-------|----------------|--------------|--------|
| Título principal | `text-h1` | `--text-h1` | 24px |
| Título de sección | `text-h2` | `--text-h2` | 20px |
| Subtítulo | `text-h3` | `--text-h3` | 18px |
| Cuerpo | `text-body` | `--text-body` | 16px |
| Pequeño / metadata | `text-sm` | `--text-sm` | 14px |
| Labels / timestamps | `text-xs` | `--text-xs` | 12px |

| Peso | Clase Tailwind | Variable CSS |
|------|----------------|---------------|
| Regular | `font-normal` | `--font-normal` |
| Medio (botones) | `font-medium` | `--font-medium` |
| Semibold (precios) | `font-semibold` | `--font-semibold` |
| Negrita (títulos) | `font-bold` | `--font-bold` |

Las etiquetas semánticas HTML tienen estilos aplicados automáticamente vía `@layer base` en `globals.css`. **No es necesario agregar clases de tamaño manualmente** a `h1`, `h2`, `h3`, `h4`, `p`, `small` ni `label`.

| Etiqueta | Tamaño automático | Peso automático |
|----------|-------------------|-----------------|
| `<h1>` | `text-h1` (24px) | `font-bold` |
| `<h2>` | `text-h2` (20px) | `font-semibold` |
| `<h3>` | `text-h3` (18px) | `font-semibold` |
| `<h4>` | `text-body` (16px) | `font-semibold` |
| `<p>` | `text-body` (16px) | `font-normal` |
| `<small>` | `text-xs` (12px) | `font-normal` |
| `<label>` | `text-sm` (14px) | `font-medium` |

```tsx
// BIEN – las etiquetas semánticas ya tienen el tamaño correcto
<h1 className="text-fg">Productos disponibles</h1>
<h2 className="text-fg">Categorías</h2>
<p className="text-fg">Descripción del item</p>
<span className="text-xs font-medium text-muted-fg">Hace 2h</span>

// También BIEN – sobreescribir cuando el diseño lo requiera
<h2 className="text-h3 font-bold text-primary">Caso especial</h2>

// MAL – tamaño hardcodeado
<h1 className="text-[24px]">Productos</h1>
<p  className="text-base">Texto</p>   {/* clase nativa Tailwind */}
```

#### Clases de color disponibles

| Categoría | Clases Tailwind | Variable CSS |
|-----------|-----------------|---------------|
| **Principales** | `bg-primary` / `text-primary` | `--primary` |
| | `bg-secondary` / `text-secondary` | `--secondary` |
| | `bg-accent` / `text-accent` | `--accent` |
| **Superficie** | `bg-bg` / `text-fg` | `--bg`, `--fg` |
| | `bg-card` / `text-card-fg` | `--card` |
| | `bg-muted` / `text-muted-fg` | `--muted-fg` |
| **Feedback** | `bg-success` / `text-success-fg` | `--success` |
| | `bg-warning` / `text-warning-fg` | `--warning` |
| | `bg-error` / `text-error-fg` | `--error` |
| | `bg-info` / `text-info-fg` | `--info` |
| **Categorías** | `bg-cat-books` | `--cat-books` |
| | `bg-cat-electronics` | `--cat-electronics` |
| | `bg-cat-clothing` | `--cat-clothing` |
| | `bg-cat-supplies` | `--cat-supplies` |

#### Variantes de botones

| Variante | Uso | Clases base |
|----------|-----|-------------|
| `primary` | Acción principal | `bg-btn-primary text-btn-primary-fg hover:bg-primary-hover` |
| `secondary` | Acción secundaria | `bg-btn-secondary text-btn-secondary-fg hover:bg-secondary-hover` |
| `template` | Ghost / outline | `bg-btn-tmpl text-btn-tmpl-fg border border-btn-tmpl-border hover:bg-btn-tmpl-hover` |
| `disabled` | Deshabilitado | `bg-btn-disabled text-btn-disabled-fg cursor-not-allowed` |

```tsx
// Ejemplos de variantes de botón
<button className="bg-btn-primary text-btn-primary-fg rounded px-4 py-2 hover:bg-primary-hover">
  Publicar item
</button>

<button className="bg-btn-secondary text-btn-secondary-fg rounded px-4 py-2 hover:bg-secondary-hover">
  Ver más
</button>

<button className="bg-btn-tmpl text-btn-tmpl-fg border border-btn-tmpl-border rounded px-4 py-2 hover:bg-btn-tmpl-hover">
  Cancelar
</button>

<button
  className="bg-btn-disabled text-btn-disabled-fg rounded px-4 py-2 cursor-not-allowed"
  disabled
>
  No disponible
</button>
```

#### Agregar nuevos colores

Si necesitas un color que no existe:

1. Convierte el color a HSL (usa una herramienta como [hslpicker.com](https://hslpicker.com) o el devtools del navegador). El valor debe ser **solo los tres números** sin la función `hsl()`:
   ```css
   /* ✅ Correcto — solo valores H S% L% */
   --mi-color: 260 80% 55%;

   /* ❌ Incorrecto — no incluir hex ni wrapper hsl() */
   --mi-color: #7c3aed;
   --mi-color: hsl(260, 80%, 55%);
   ```
2. Agrégalo en `src/app/globals.css` dentro de `:root` Y su equivalente en `.dark`:
   ```css
   :root {
     --mi-color: 260 80% 55%;
   }
   .dark {
     --mi-color: 270 85% 65%;
   }
   ```
3. Mapéalo en `tailwind.config.js` con el formato `<alpha-value>` para habilitar modificadores de opacidad:
   ```js
   'mi-color': 'hsl(var(--mi-color) / <alpha-value>)',
   ```
4. Usa la nueva clase Tailwind en el componente. Ya puedes usar modificadores de opacidad:
   ```tsx
   <div className="bg-mi-color/10 text-mi-color border border-mi-color/30">...</div>
   ```

**Prohibido:**

```tsx
<div className="bg-[#7c3aed]">...</div>       // Valor hex hardcodeado
<div style={{ color: '#7c3aed' }}>...</div>   // Style inline con hex
<div className="text-purple-600">...</div>     // Color nativo de Tailwind
```

**Prohibido también en globals.css:**

```css
/* ❌ No registrar colores en hex — rompe los modificadores de opacidad de Tailwind */
--mi-color: #7c3aed;
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