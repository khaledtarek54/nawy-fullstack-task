export function formatPrice(price: number | null, currency: string): string {
  if (price === null || !Number.isFinite(price) || price <= 0) {
    return 'Price on request';
  }

  return `${currency} ${price.toLocaleString()}`;
}
