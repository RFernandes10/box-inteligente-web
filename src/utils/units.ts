export const UNIT_LABELS: Record<string, string> = {
  UN: 'Unidade',
  KG: 'Quilograma',
  CX: 'Caixa',
  PCT: 'Pacote',
  L: 'Litro',
  G: 'Grama',
};

export const WEIGHT_UNITS: Record<string, string> = {
  UN: 'kg',
  KG: 'kg',
  CX: 'kg',
  PCT: 'kg',
  L: 'L',
  G: 'g',
};

export function getUnitLabel(unit: string): string {
  return UNIT_LABELS[unit] || unit;
}

export function getWeightDisplay(weight: number | null | undefined, unit: string): string {
  if (!weight) return '-';
  const suffix = WEIGHT_UNITS[unit] || 'kg';
  return `${weight} ${suffix}`;
}
