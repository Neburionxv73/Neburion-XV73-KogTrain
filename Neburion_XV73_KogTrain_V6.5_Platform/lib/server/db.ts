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
        login_name text unique not null,
        display_name text not null,
        password_hash text not null,
        recovery_code_hash text,
        created_at timestamptz not null default now()
      )`;

      await sql`alter table kogtrain_users add column if not exists login_name text`;
      await sql`alter table kogtrain_users add column if not exists recovery_code_hash text`;

      // One-time compatibility migration for databases created before email-free accounts.
      // Dynamic SQL keeps fresh databases valid when the legacy email column does not exist.
      await sql.unsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'kogtrain_users'
              AND column_name = 'email'
          ) THEN
            EXECUTE 'UPDATE kogtrain_users SET login_name = lower(email) WHERE login_name IS NULL AND email IS NOT NULL';
          END IF;
        END $$;
      `);

      await sql`update kogtrain_users set login_name = 'spieler-' || left(id, 8) where login_name is null`;
      await sql`alter table kogtrain_users alter column login_name set not null`;
      await sql`create unique index if not exists kogtrain_users_login_name_unique on kogtrain_users(login_name)`;
      await sql`alter table kogtrain_users drop column if exists email`;

      await sql`create table if not exists kogtrain_player_state (
        user_id text primary key references kogtrain_users(id) on delete cascade,
        payload jsonb not null,
        updated_at timestamptz not null default now()
      )`;
    })();
  }
  return schemaReady;
}
