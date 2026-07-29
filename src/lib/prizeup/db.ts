import "server-only";
import { Pool } from "pg";
import { getPrizeUpDatabaseUrl } from "@/lib/env";

// PrizeUp's own Supabase project — a separate, live production database
// (real users, real coins/gems, real withdrawal requests). This connects
// directly via Postgres (bypasses RLS entirely, same as a service-role key
// would), read-only usage for now. Never import this from a "use client"
// module. Pool is cached on `global` so dev hot-reload doesn't leak
// connections against the real database.
declare global {
  var __prizeupPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global.__prizeupPool) {
    global.__prizeupPool = new Pool({
      connectionString: getPrizeUpDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 5,
      // Release idle connections back to the (shared, finite) connection
      // budget instead of pinning them for this serverless instance's whole
      // lifetime, and fail fast rather than hang when the pooler is under
      // pressure — callers should see an error quickly, not a stalled page.
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return global.__prizeupPool;
}

export async function prizeupQuery<
  T extends Record<string, unknown> = Record<string, unknown>,
>(text: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

type TxQuery = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) => Promise<T[]>;

// For writes that must be all-or-nothing (e.g. a balance update plus its
// ledger entry) — a single connection, BEGIN/COMMIT, ROLLBACK on any error.
// `prizeupQuery` alone can't guarantee this since it may use a different
// pooled connection per call.
export async function prizeupTransaction<T>(
  fn: (query: TxQuery) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const query: TxQuery = async (text, params) => {
      const result = await client.query(text, params);
      return result.rows;
    };
    const result = await fn(query);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
