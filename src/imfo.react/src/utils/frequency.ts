export function getPeriodRange(frequency: string) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (frequency) {
    case 'weekly':
      const currentDay = now.getDay();
      const daysSinceSunday = currentDay;
      const daysUntilSaturday = 6 - currentDay;

      start.setDate(now.getDate() - daysSinceSunday);
      start.setHours(0, 0, 0, 0);

      end.setDate(now.getDate() + daysUntilSaturday);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    case 'bi-weekly':
      const currentDayBiWeekly = now.getDay();
      const daysSincePreviousSunday = currentDayBiWeekly + 7;

      start.setDate(now.getDate() - daysSincePreviousSunday);
      start.setHours(0, 0, 0, 0);

      end.setDate(now.getDate() + (6 - currentDayBiWeekly));
      end.setHours(23, 59, 59, 999);
      return { start, end };
    case 'monthly':
      start.setFullYear(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    case 'yearly':
      start.setFullYear(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    default:
      start.setTime(0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
  }
}

export function getPeriodStart(frequency: string) {
  return getPeriodRange(frequency).start;
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
