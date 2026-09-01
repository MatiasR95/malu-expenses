export function formatARS(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    if (Math.abs(amount) >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `$${millions.toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      const thousands = amount / 1_000;
      return `$${thousands.toLocaleString('en-US', { maximumFractionDigits: 0 })}k`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  }

  return `$ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDecimalParts(amount: number): { prefix: string; integer: string; decimal: string } {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formattedInt = Math.floor(absAmount).toLocaleString('en-US');
  return {
    prefix: isNegative ? '-$ ' : '$ ',
    integer: formattedInt,
    decimal: '.0',
  };
}

