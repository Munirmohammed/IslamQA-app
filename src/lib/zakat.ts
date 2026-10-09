/**
 * Zakat calculation: 2.5% of net zakatable wealth, owed only once that
 * wealth meets or exceeds the nisab threshold.
 *
 * Nisab is traditionally defined in physical gold (87.48g) or silver
 * (612.36g), not a fixed currency amount -- its value in any given
 * currency moves with the metal's market price. Rather than hardcoding a
 * price that would silently go stale (this is a religious-obligation
 * calculation; a wrong number has real consequences), the nisab threshold
 * is a value the user supplies themselves, looked up for today in their
 * own currency.
 */

export const ZAKAT_RATE = 0.025;

export interface ZakatInputs {
  cash: number;
  goldAndSilver: number;
  investments: number;
  businessAssets: number;
  moneyOwedToYou: number;
  debtsDue: number;
  nisabThreshold: number;
}

export interface ZakatResult {
  totalAssets: number;
  netWealth: number;
  meetsNisab: boolean;
  zakatDue: number;
}

export function calculateZakat(inputs: ZakatInputs): ZakatResult {
  const totalAssets =
    inputs.cash + inputs.goldAndSilver + inputs.investments + inputs.businessAssets + inputs.moneyOwedToYou;
  const netWealth = Math.max(0, totalAssets - inputs.debtsDue);
  const meetsNisab = inputs.nisabThreshold > 0 && netWealth >= inputs.nisabThreshold;

  return {
    totalAssets,
    netWealth,
    meetsNisab,
    zakatDue: meetsNisab ? netWealth * ZAKAT_RATE : 0,
  };
}
