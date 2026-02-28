// msnodesqlv8 uses the native Windows ODBC driver stack.
// It connects via Shared Memory (no TCP/IP required) and authenticates
// via SSPI — the current Windows session identity is passed automatically.
import sql from "mssql/msnodesqlv8";
import dotenv from "dotenv";

dotenv.config();

const database = process.env.DB_NAME || "SimpleProjectDB";

// "(local)" tells the ODBC driver to prefer Shared Memory, then Named Pipes —
// it never tries TCP/IP, so port 1433 does not need to be open.
// "ODBC Driver 17 for SQL Server" is confirmed installed on this machine.
// Trusted_Connection=Yes → Windows Authentication via SSPI.
const connectionString =
  `Driver={ODBC Driver 17 for SQL Server};` +
  `Server=(local);` +
  `Database=${database};` +
  `Trusted_Connection=Yes;`;

// mssql's TS types don't expose `connectionString` even though the runtime code
// reads it directly (mssql/lib/msnodesqlv8/connection-pool.js line 22).
// We cast through unknown to work around the missing type declaration.
const dbConfig = {
  connectionString,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
} as unknown as sql.config;

// Singleton connection pool — reused across all requests.
let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log("[DB] Connected to SQL Server via msnodesqlv8 (Windows Auth / Shared Memory)");
  }
  return pool;
}

export { sql };
