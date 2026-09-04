import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL
    ?? process.env.DATABASE_POSTGRES_URL
    ?? process.env.DATABASE_POSTGRES_PRISMA_URL
    ?? process.env.POSTGRES_URL
    ?? process.env.POSTGRES_PRISMA_URL
    ?? null;
}

export function getSql() {
  const url = resolveDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");
  if (!client) client = postgres(url, { ssl: "require", max: 1, prepare: false });
  return client;
}

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`create table if not exists kogtrain_users (
        id text primary key,
        email text unique not null,
        display_name text not null,
        password_hash text not null,
        created_at timestamptz not null default now()
      )`;
      await sql`create table if not exists kogtrain_player_state (
        user_id text primary key references kogtrain_users(id) on delete cascade,
        payload jsonb not null,
        updated_at timestamptz not null default now()
      )`;
    })();
  }
  return schemaReady;
}
