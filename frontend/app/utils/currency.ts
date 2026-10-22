import { dinero, toDecimal } from "dinero.js";
import { GBP } from "dinero.js/currencies";

/**
 * Formats an amount in pence as pounds without a currency symbol, e.g. 1250 -> "12.50".
 * With dropZeroPence, whole pound amounts leave off the pence, e.g. 1200 -> "12".
 */
export function formatPence(amount: number, dropZeroPence = false) {
  const value = toDecimal(dinero({ amount, currency: GBP }));

  if (dropZeroPence && amount % 100 === 0) {
    return value.slice(0, -3);
  }

  return value;
}
