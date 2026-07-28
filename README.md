# Danson Liabana · Panel de finanzas

Panel de control financiero de **Danson Liabana**. Responde de un vistazo las
tres preguntas que de verdad importan: **¿cuánto me queda este mes?**, **¿en qué
se va el dinero?** y **¿qué me cuesta tener la marca funcionando cada mes?**

Proyecto **independiente** (repo, base de datos y deploy propios). No comparte
nada con ningún otro negocio.

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Base de datos y auth:** Supabase (Postgres con RLS + Supabase Auth por enlace mágico)
- **Estilos:** Tailwind CSS v4
- **Deploy:** Vercel

## Qué incluye (Fase 1 — MVP)

- **Panel** — facturación, gastos y **beneficio neto** del mes, con comparativa
  contra el mes anterior; "lo que te queda", el peso de los gastos fijos y el
  avance hacia tu meta.
- **Movimientos** — registra cada ingreso y gasto, en USD, EUR o VES; el panel
  lo normaliza todo a dólares.
- **Fijos** — la lista de lo que se cobra solo cada mes (Shopify, apps,
  comisiones, almacén, nómina…). Aquí es donde el dinero "se va lentamente".
- **Ajustes** — tasas de cambio (EUR/VES → USD) y meta de beneficio mensual.

> **Modo demostración:** si aún no has conectado Supabase, la app arranca con
> datos de ejemplo para que veas cómo se ve funcionando. En cuanto pongas las
> variables de entorno, usa tus datos reales.

## Puesta en marcha

### 1. Correr en local

Requisitos: **Node 22** y npm.

```bash
npm install
cp .env.local.example .env.local   # opcional para ver el modo demostración
npm run dev                        # http://localhost:3000
```

### 2. Crear la base de datos (Supabase)

1. Crea un proyecto **nuevo** en [supabase.com/dashboard](https://supabase.com/dashboard).
2. Abre **SQL Editor** y pega el contenido de [`supabase/schema.sql`](supabase/schema.sql). Ejecútalo.
3. En **Settings → API**, copia `Project URL` y la `anon public key`.

### 3. Variables de entorno

Copia `.env.local.example` a `.env.local` (local) y ponlas también en Vercel.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (pública). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase (pública, protegida por RLS). |
| `ALLOWED_EMAILS` | Correos con permiso de entrar, separados por coma. |

### 4. Deploy en Vercel

1. Importa este repo en [vercel.com](https://vercel.com) (proyecto **nuevo**, aparte de cualquier otro).
2. Pega las tres variables de entorno en *Settings → Environment Variables*.
3. Deploy. Cada push a `main` vuelve a desplegar.

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # eslint
```

## Estructura

```
src/app/            Rutas: panel (/), movimientos, fijos, ajustes, login, api, auth
src/components/     UI compartida (icons.tsx = set de iconos de línea propio)
src/lib/            data/ (Supabase), money, calc, types, demo, hook de carga
src/proxy.ts        Middleware de auth + whitelist de correos
supabase/schema.sql Esquema (tablas, RLS, categorías semilla)
```

## Roadmap

- **Fase 2 — Rentabilidad:** margen real por prenda (producción + envío +
  comisiones) con semáforo, y lotes de producción (dinero comprometido vs.
  recuperado).
- **Fase 3 — Proyección:** runway y proyección de caja.
- **Importadores:** Shopify / banco / Excel para no cargar a mano.
