import "server-only";
import { evaluateCoupon, normalizeCode } from "@/lib/coupons";
import { ApiError, number, text } from "../api";
import { query, queryOne } from "../db";

const toCoupon = (r) => ({ code: r.code, type: r.type, value: Number(r.value), minOrder: Number(r.min_order), active: !!r.is_active });

// Cart: checks a code without revealing the other coupons.
export async function checkCoupon(code, subtotal) {
  const row = await queryOne("SELECT * FROM coupons WHERE code = ?", [normalizeCode(code)]);
  const coupon = row ? toCoupon(row) : null;
  const result = evaluateCoupon(coupon, Number(subtotal) || 0);
  if (result.error) throw new ApiError(400, result.error);
  return coupon;
}

export async function listCoupons() {
  const [rows, usage] = await Promise.all([
    query("SELECT * FROM coupons ORDER BY id"),
    query(
      `SELECT coupon_code, COUNT(*) AS uses, SUM(discount) AS saved FROM orders
        WHERE coupon_code IS NOT NULL AND status <> 'Cancelled' AND is_demo = 0 GROUP BY coupon_code`
    ),
  ]);
  const byCode = new Map(usage.map((u) => [u.coupon_code, u]));
  return rows.map((r) => ({ ...toCoupon(r), uses: Number(byCode.get(r.code)?.uses ?? 0), saved: Number(byCode.get(r.code)?.saved ?? 0) }));
}

export async function saveCoupon(data, originalCode) {
  const code = normalizeCode(text(data.code, "Code", { max: 40 }));
  if (!/^[A-Z0-9_-]+$/.test(code)) throw new ApiError(400, "Codes can only use letters, numbers, - and _.");
  if (!["percent", "fixed"].includes(data.type)) throw new ApiError(400, "Choose a discount type.");
  const value = number(data.value, "Discount", { min: 1, max: data.type === "percent" ? 90 : 10_000_000 });
  const minOrder = number(data.minOrder ?? 0, "Minimum order", { min: 0 });
  const clash = await queryOne("SELECT id FROM coupons WHERE code = ?", [code]);
  if (clash && code !== originalCode) throw new ApiError(409, `Coupon ${code} already exists.`);
  if (originalCode) {
    const result = await query("UPDATE coupons SET code = ?, type = ?, value = ?, min_order = ?, is_active = ? WHERE code = ?", [
      code, data.type, value, minOrder, !!data.active, normalizeCode(originalCode),
    ]);
    if (result.affectedRows === 0) throw new ApiError(404, "Coupon not found.");
  } else {
    await query("INSERT INTO coupons (code, type, value, min_order, is_active) VALUES (?, ?, ?, ?, ?)", [code, data.type, value, minOrder, !!data.active]);
  }
}

export async function deleteCoupon(code) {
  await query("DELETE FROM coupons WHERE code = ?", [normalizeCode(code)]);
}
