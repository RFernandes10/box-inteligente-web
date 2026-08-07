interface ApiErrorShape {
  response?: { data?: { error?: string } };
  message?: string;
}

export function getApiError(err: unknown, fallback: string): string {
  const error = err as ApiErrorShape;
  return error?.response?.data?.error || error?.message || fallback;
}

export function assertValidMovement(selected: unknown, quantity: string): number {
  if (!selected) throw new Error('Selecione um produto antes de registrar a movimentação');
  const qty = Number(quantity);
  if (!quantity || !Number.isInteger(qty) || qty <= 0) {
    throw new Error('Informe uma quantidade inteira maior que zero');
  }
  return qty;
}