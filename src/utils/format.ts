export function formatCurrency(value: number): string {
  return `R$ ${Number(value).toFixed(2)}`;
}