export function getPeriodStart(frequency: string) {
  const now = new Date();
  switch (frequency) {
    case 'weekly':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(0);
  }
}

function getFrequencyMultiplier(frequency: string): number {
  switch (frequency.toLowerCase()) {
    case 'weekly':
      return 52;
    case 'bi-weekly':
      return 26;
    case 'monthly':
      return 12;
    case 'yearly':
      return 1;
    case 'one-time':
    default:
      return 1;
  }
}

export function normalizeAmount(amount: number, fromFrequency: string, toFrequency: string) {
  const fromPeriods = getFrequencyMultiplier(fromFrequency);
  const toPeriods = getFrequencyMultiplier(toFrequency);
  return amount * (fromPeriods / toPeriods);
}
