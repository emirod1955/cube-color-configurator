export const PRICES = {
  base: 1400,      // base de madera + letras
  perPerson: 50,   // por figura (sin importar tamaño)
} as const;

export function calcTotal(numPersons: number): number {
  return PRICES.base + numPersons * PRICES.perPerson;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(amount);
}
