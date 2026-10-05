// Mirrors backend app/core/pricing.py — the server sets the amount Stripe charges
export const PRICES: Record<number, string> = {
  15: '£4.99',
  30: '£8.99',
  45: '£13.99',
  60: '£19.99',
}

export const FREE_INTERVIEW_MINUTES = 10

export function priceDisplay(minutes: number | undefined, amountPence?: number | null): string {
  return (minutes ? PRICES[minutes] : undefined) ?? `£${((amountPence || 0) / 100).toFixed(2)}`
}
