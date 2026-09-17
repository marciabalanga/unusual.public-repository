export function formatAOA(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' AOA';
}

export function generateTrackingCode(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `WU-${randomSixDigits}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
}
