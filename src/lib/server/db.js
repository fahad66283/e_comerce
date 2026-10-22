import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

// MySQL connection, configured from environment variables (.env locally, hPanel on Hostinger):
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("The database is not configured. Add DB_HOST, DB_USER, DB_PASSWORD and DB_NAME to your .env file.");
    this.code = "DB_NOT_CONFIGURED";
  }
}

function config() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) throw new DatabaseNotConfiguredError();
  return {
    host: DB_HOST,
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD ?? "",
    database: DB_NAME,
    charset: "utf8mb4_unicode_ci",
    timezone: "Z", // all DATETIME values are stored in UTC
    decimalNumbers: true,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5,
    connectTimeout: 10000,
    enableKeepAlive: true,
  };
}

// One pool per server process (kept on globalThis so dev hot-reloads don't open new pools).
const state = (globalThis.__hakDb ??= { pool: null, ready: null });

function getPool() {
  if (!state.pool) {
    state.pool = mysql.createPool(config());
    // Every connection uses UTC, matching how dates are read back.
    state.pool.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));
  }
  return state.pool;
}

// ---- Automatic setup: apply migrations and load default data into an empty database ----
const DATABASE_DIR = path.join(process.cwd(), "database");

async function runSqlFile(file) {
  const sql = await fs.readFile(file, "utf8");
  // A separate connection with multi-statement support, used only for our own SQL files.
  const conn = await mysql.createConnection({ ...config(), multipleStatements: true });
  try {
    await conn.query("SET time_zone = '+00:00'");
    await conn.query(sql);
  } finally {
    await conn.end();
  }
}

async function setUpDatabase() {
  const pool = getPool();
  await pool.query(
    "CREATE TABLE IF NOT EXISTS `schema_migrations` (`version` VARCHAR(100) NOT NULL, `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`version`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
  );
  const [rows] = await pool.query("SELECT version FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.version));
  const files = (await fs.readdir(path.join(DATABASE_DIR, "migrations"))).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (applied.has(version)) continue;
    console.log(`[database] applying migration ${version}`);
    await runSqlFile(path.join(DATABASE_DIR, "migrations", file));
    await pool.query("INSERT IGNORE INTO schema_migrations (version) VALUES (?)", [version]);
  }
  // First start on an empty database: load the default store (products, content, staff accounts).
  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM users");
  if (count === 0) {
    console.log("[database] empty database – loading default data");
    await runSqlFile(path.join(DATABASE_DIR, "seeds", "001_default_data.sql"));
  }
}

async function ready() {
  if (!state.ready) {
    state.ready = setUpDatabase().catch((err) => {
      state.ready = null; // try again on the next request
      throw err;
    });
  }
  return state.ready;
}

export async function query(sql, params = []) {
  await ready();
  const [rows] = await getPool().query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

// Runs fn(conn) inside a transaction; conn.query(sql, params) returns rows.
export async function transaction(fn) {
  await ready();
  const conn = await getPool().getConnection();
  const tx = { query: async (sql, params = []) => (await conn.query(sql, params))[0] };
  try {
    await conn.beginTransaction();
    const result = await fn(tx);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export function escape(value) {
  return mysql.escape(value);
}

// A short, safe description of a connection problem (no passwords or hostnames).
export function describeDatabaseError(err) {
  if (err?.code === "DB_NOT_CONFIGURED") return "Database settings are missing from the .env file.";
  const known = {
    ER_ACCESS_DENIED_ERROR: "The database username or password is wrong.",
    ER_BAD_DB_ERROR: "The database name doesn't exist.",
    ECONNREFUSED: "The database server refused the connection (check DB_HOST and DB_PORT).",
    ENOTFOUND: "The database host could not be found (check DB_HOST).",
    ETIMEDOUT: "Connecting to the database timed out (check DB_HOST, and Remote MySQL access if the database is on another server).",
    ER_DBACCESS_DENIED_ERROR: "This database user has no access to the database.",
  };
  return known[err?.code] ?? "Could not connect to the database.";
}
