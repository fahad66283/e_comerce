import { connection } from "next/server";
import { describeDatabaseError, query } from "@/lib/server/db";

// Visit /api/health to check the database connection (no secrets are shown).
export async function GET() {
  await connection();
  try {
    const [{ products }] = await query("SELECT COUNT(*) AS products FROM products");
    return Response.json({ ok: true, database: "connected", products: Number(products) });
  } catch (err) {
    console.error("[health]", err.code, err.message);
    return Response.json({ ok: false, database: "error", message: describeDatabaseError(err) }, { status: 503 });
  }
}
