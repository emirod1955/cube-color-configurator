export const PRICES = {
  base: 1400,      // base de madera + letras
  perPerson: 50,   // por figura (sin importar tamaño)
  perPet: 470,     // por mascota
} as const;

export function calcTotal(numPersons: number, numPets = 0): number {
  return PRICES.base + numPersons * PRICES.perPerson + numPets * PRICES.perPet;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(amount);
}
