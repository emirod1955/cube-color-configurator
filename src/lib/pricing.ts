export const PRICES = {
  base: 1550,           // base + cúpula + letras + hasta 2 integrantes
  perExtraPerson: 100,  // por cada integrante a partir del 3ro
  perPet: 470,          // por mascota
} as const;

export function calcTotal(numPersons: number, numPets = 0): number {
  const extraPersons = Math.max(0, numPersons - 2);
  return PRICES.base + extraPersons * PRICES.perExtraPerson + numPets * PRICES.perPet;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(amount);
}
