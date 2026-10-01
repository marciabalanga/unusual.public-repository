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

export function isComingBackSoonBadge(badge?: string | null): boolean {
  if (!badge) return false;
  const upper = badge.trim().toUpperCase();
  return upper === 'AGUARDANDO VAGA';
}

export function getProductBadgeDisplay(badge?: string | null, language: 'pt' | 'en' = 'pt'): string | null {
  if (!badge) return null;
  const clean = badge.trim();
  const upper = clean.toUpperCase();
  if (!upper || upper === 'SEM BADGE' || upper === 'NONE') return null;

  if (upper === 'AGUARDANDO VAGA') {
    return language === 'en' ? 'COMING BACK SOON' : 'AGUARDANDO VAGA';
  }
  if (upper === 'ESGOTADO') {
    return 'ESGOTADO';
  }
  if (upper === 'EDIÇÃO LIMITADA' || upper === 'EDICAO LIMITADA') {
    return 'EDIÇÃO LIMITADA';
  }
  if (upper === 'NOVO') {
    return 'NOVO';
  }

  return clean;
}

export function getProductReturnDateDisplay(product?: { badge?: string | null; return_date?: string } | null): string | null {
  if (!product || !isComingBackSoonBadge(product.badge)) return null;
  if (!product.return_date || product.return_date.trim() === '') return null;
  return product.return_date.trim();
}
