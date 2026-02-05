# San Martín Performance Lab — MVP

**Laboratorio de Alto Rendimiento con Inteligencia Contextual**
Plantel profesional de San Martín de Tucumán.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 + App Router + TypeScript + Tailwind CSS v4 |
| UI | Componentes custom (badge, card, button, skeleton, input) |
| Charts | Recharts |
| Backend / Auth / DB | Supabase (Auth + Postgres + RLS) |
| Chat (RAG interno) | Route Handler Next.js + queries SQL. LLM opcional por ENV |
| Deploy | Vercel |

---

## Estructura del proyecto

```
├── app/                    Next.js pages (App Router)
│   ├── login/              Página de login
│   ├── roster/             Listado de plantel
│   ├── players/[id]/       Perfil individual + QR
│   ├── ingest/             Carga manual + CSV
│   ├── dashboard/          KPIs + charts + alertas
│   ├── assistant/          Chat contextual
│   ├── admin/users/        Gestión de usuarios (superadmin)
│   └── api/chat/           Route Handler del asistente
├── components/
│   ├── layout/             AppShell, Sidebar, Topbar
│   ├── ui/                 Badge, Card, Button, Input, Skeleton, EmptyState
│   ├── roster/             RosterClient, PlayerModal, PlayerProfile
│   ├── ingest/             ManualForm, CsvForm
│   ├── dashboard/          DashboardClient
│   ├── assistant/          AssistantClient
│   └── admin/              AdminUsersClient
├── lib/
│   ├── supabase/           client.ts (browser), server.ts (SSR + service)
│   ├── auth/               session.ts, middleware.ts
│   ├── queries/            players, sessions, metrics, users
│   ├── chat/               engine.ts (RAG sin LLM)
│   └── utils.ts            cn(), formatters, labels
├── types/
│   ├── database.ts         Tipos TS espejo del schema SQL
│   └── schemas.ts          Zod schemas de validación
├── db/
│   ├── migrations/
│   │   ├── 001_schema.sql  Tablas, enums, índices, triggers
│   │   └── 002_rls_policies.sql  Row Level Security
│   └── seeds/
│       ├── seed_real_players.sql  SQL puro con jugadores reales
│       └── run-seed.ts     Script que seembra jugadores + métricas de ejemplo
├── middleware.ts           Auth middleware
├── .env.local              Variables de entorno
└── README.md
```

---

## Inicio rápido

### 1. Requisitos
- Node.js >= 18
- npm >= 9
- Cuenta Supabase con proyecto activo

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Editá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Solo server-side
# LLM_PROVIDER=openai                   # opcional
# LLM_API_KEY=sk-...                    # opcional
APP_ENV=dev
```

### 4. Aplicar migrations

En Supabase Studio → SQL Editor:
1. Ejecutá `db/migrations/001_schema.sql`
2. Ejecutá `db/migrations/002_rls_policies.sql`

### 5. Crear usuario superadmin

En Supabase Studio → Auth → Users → Sign Up:
- Email: `admin@sanmartin.edu.ar`
- Contraseña: `admin1234`

Luego en SQL Editor:

```sql
INSERT INTO public.user_profiles (user_id, full_name, role, active)
VALUES ('<uuid-del-usuario>', 'Admin Demo', 'superadmin', true);
```

### 6. Seedear datos de ejemplo

```bash
npx tsx db/seeds/run-seed.ts
```

Seembra 38 jugadores reales, 12 sesiones y métricas GPS / saltos / fuerza.

### 7. Correr en desarrollo

```bash
npm run dev
```

Abrí http://localhost:3000 → login con las credenciales del paso 5.

---

## Roles

| Rol | Descripción |
|---|---|
| `superadmin` | Control total |
| `company_dev` | Admin técnico, sin datos en prod |
| `admin_pf` | PF institucional — carga y visualiza todo |
| `admin_staff` | Staff con permisos acotados |
| `viewer` | Solo lectura según `permission_assignments` |

---

## Chat contextual

Sin LLM por defecto: interpreta por keywords, ejecuta SQL, devuelve respuesta con fuentes citadas.
Para habilitar LLM: setear `LLM_PROVIDER` + `LLM_API_KEY` y activar el TODO en `lib/chat/engine.ts`.

**Nunca inventa datos.** Si no hay información responde explícitamente.

---

## TODOs pendientes

- [ ] Conectar LLM real para formulación de respuestas
- [ ] Tabla `groups` para permisos por grupo
- [ ] Baselines individuales (tabla dedicada vs promedios móviles)
- [ ] Upload avatar a Storage
- [ ] Custom metrics (tabla flexible)
- [ ] Export PDF/Excel
- [ ] Notificaciones de alertas
- [ ] Modo dev para company_dev en RLS
- [ ] Tests (Vitest)
- [ ] Observabilidad (Sentry)
