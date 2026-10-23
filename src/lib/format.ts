export function formatCurrency(amount: number | string | undefined | null): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(safe);
}