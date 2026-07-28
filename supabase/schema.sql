-- ════════════════════════════════════════════════════════════════════
--  Danson Liabana — Esquema de finanzas
--  Aplicar en: Supabase → SQL Editor (proyecto propio de Danson Liabana).
--  Idempotente donde se puede; seguro de re-correr.
-- ════════════════════════════════════════════════════════════════════

-- ── Ajustes (fila única) ─────────────────────────────────────────────
-- Tasas de cambio y meta. "tasa_*_usd" = cuántos USD vale 1 unidad de esa
-- moneda. Ej: 1 EUR = 1.08 USD → tasa_eur_usd = 1.08.
--            1 USD = 40 VES     → tasa_ves_usd = 0.025.
create table if not exists ajustes (
  id integer primary key default 1 check (id = 1),
  tasa_eur_usd numeric(18,6) not null default 1.08,
  tasa_ves_usd numeric(18,8) not null default 0.025,
  meta_beneficio_usd numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);
insert into ajustes (id) values (1) on conflict (id) do nothing;

-- ── Categorías ───────────────────────────────────────────────────────
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  color text,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Gastos recurrentes / fijos (suscripciones, nómina, almacén…) ─────
create table if not exists recurrentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  monto numeric(14,2) not null check (monto >= 0),
  moneda text not null default 'USD' check (moneda in ('USD', 'EUR', 'VES')),
  dia_cobro integer check (dia_cobro between 1 and 31),
  categoria_id uuid references categorias(id) on delete set null,
  activo boolean not null default true,
  notas text,
  created_at timestamptz not null default now()
);

-- ── Movimientos (libro de ingresos y gastos) ─────────────────────────
-- Cada fila guarda su moneda nativa + la tasa usada + el monto ya
-- normalizado a USD (monto_usd), para que el panel sume una sola cifra.
create table if not exists movimientos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  categoria_id uuid references categorias(id) on delete set null,
  descripcion text not null default '',
  monto numeric(14,2) not null check (monto >= 0),
  moneda text not null default 'USD' check (moneda in ('USD', 'EUR', 'VES')),
  tasa_usd numeric(18,8) not null default 1,
  monto_usd numeric(14,2) not null,
  canal text,
  es_fijo boolean not null default false,
  recurrente_id uuid references recurrentes(id) on delete set null,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists movimientos_fecha_idx on movimientos (fecha desc);
create index if not exists movimientos_tipo_idx on movimientos (tipo);
create index if not exists movimientos_categoria_idx on movimientos (categoria_id);

-- ── RLS: solo usuarios autenticados (single-tenant) ──────────────────
alter table ajustes enable row level security;
alter table categorias enable row level security;
alter table recurrentes enable row level security;
alter table movimientos enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ajustes', 'categorias', 'recurrentes', 'movimientos']
  loop
    execute format('drop policy if exists %I_auth_all on %I', t, t);
    execute format(
      'create policy %I_auth_all on %I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end $$;

-- ── Semilla de categorías (solo si la tabla está vacía) ──────────────
insert into categorias (nombre, tipo, color, orden)
select * from (values
  ('Ventas web',            'ingreso', '#1e7a5a', 10),
  ('Ventas Instagram',      'ingreso', '#1e7a5a', 20),
  ('Ventas mayor',          'ingreso', '#1e7a5a', 30),
  ('Otros ingresos',        'ingreso', '#1e7a5a', 90),
  ('Producción (Barcelona)','gasto',   '#b23a2f', 10),
  ('Materia prima / muestras','gasto', '#b23a2f', 20),
  ('Envíos / logística',    'gasto',   '#b23a2f', 30),
  ('Marketing / Ads',       'gasto',   '#b23a2f', 40),
  ('Comisiones plataforma', 'gasto',   '#b23a2f', 50),
  ('Software / Apps',       'gasto',   '#b23a2f', 60),
  ('Nómina / Colaboradores','gasto',   '#b23a2f', 70),
  ('Almacén',               'gasto',   '#b23a2f', 80),
  ('Impuestos / Banco',     'gasto',   '#b23a2f', 85),
  ('Otros gastos',          'gasto',   '#b23a2f', 90)
) as seed(nombre, tipo, color, orden)
where not exists (select 1 from categorias);
