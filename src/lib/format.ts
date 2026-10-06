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

export function formatDate(dateString: string, language: 'pt' | 'en' = 'pt'): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'pt-AO', {
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

export function formatSimpleDate(dateString: string, language: 'pt' | 'en' = 'pt'): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function isComingBackSoonBadge(badge?: string | null): boolean {
  if (!badge) return false;
  const upper = badge.trim().toUpperCase();
  return upper === 'AGUARDANDO VAGA' || upper === 'COMING BACK SOON';
}

export function getProductBadgeDisplay(badge?: string | null, language: 'pt' | 'en' = 'pt'): string | null {
  if (!badge) return null;
  const clean = badge.trim();
  const upper = clean.toUpperCase();
  if (!upper || upper === 'SEM BADGE' || upper === 'NONE') return null;

  if (upper === 'AGUARDANDO VAGA' || upper === 'COMING BACK SOON') {
    return language === 'en' ? 'COMING BACK SOON' : 'AGUARDANDO VAGA';
  }
  if (upper === 'ESGOTADO' || upper === 'SOLD OUT') {
    return language === 'en' ? 'SOLD OUT' : 'ESGOTADO';
  }
  if (upper === 'EDIÇÃO LIMITADA' || upper === 'EDICAO LIMITADA' || upper === 'LIMITED EDITION') {
    return language === 'en' ? 'LIMITED EDITION' : 'EDIÇÃO LIMITADA';
  }
  if (upper === 'NOVO' || upper === 'NEW') {
    return language === 'en' ? 'NEW' : 'NOVO';
  }

  return clean;
}

export function getOrderStatusDisplay(status?: string | null, language: 'pt' | 'en' = 'pt'): string {
  if (!status) return language === 'en' ? 'PENDING' : 'PENDENTE';
  const s = status.trim().toUpperCase();

  const statusMapEn: Record<string, string> = {
    'ORDER CONFIRMED': 'ORDER CONFIRMED',
    'PRE-ORDER CONFIRMED': 'PRE-ORDER CONFIRMED',
    'PEDIDO CONFIRMADO': 'ORDER CONFIRMED',
    'PENDENTE DE VERIFICAÇÃO': 'PENDING VERIFICATION',
    'PENDENTE': 'PENDING',
    'PAYMENT VERIFIED': 'PAYMENT VERIFIED',
    'APROVADO': 'PAYMENT VERIFIED',
    'IN PRODUCTION': 'IN PRODUCTION',
    'EM PRODUÇÃO': 'IN PRODUCTION',
    'EM PRODUÇÃO/TRÂNSITO': 'IN PRODUCTION / IN TRANSIT',
    'PRODUCTION COMPLETED / READY FOR DELIVERY': 'PRODUCTION COMPLETED / READY FOR DELIVERY',
    'READY FOR DELIVERY': 'READY FOR DELIVERY',
    'DELIVERY SCHEDULED': 'DELIVERY SCHEDULED',
    'ENTREGA AGENDADA': 'DELIVERY SCHEDULED',
    'OUT FOR DELIVERY': 'OUT FOR DELIVERY',
    'EM TRÂNSITO': 'OUT FOR DELIVERY',
    'PRESTES A CHEGAR': 'ARRIVING SOON',
    'DELIVERED': 'DELIVERED',
    'ENTREGUE': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
    'CANCELADO': 'CANCELLED',
  };

  const statusMapPt: Record<string, string> = {
    'ORDER CONFIRMED': 'PEDIDO CONFIRMADO',
    'PRE-ORDER CONFIRMED': 'PRÉ-ENCOMENDA CONFIRMADA',
    'PEDIDO CONFIRMADO': 'PEDIDO CONFIRMADO',
    'PENDENTE DE VERIFICAÇÃO': 'PENDENTE DE VERIFICAÇÃO',
    'PENDENTE': 'PENDENTE',
    'PAYMENT VERIFIED': 'PAGAMENTO VERIFICADO',
    'APROVADO': 'PAGAMENTO VERIFICADO',
    'IN PRODUCTION': 'EM PRODUÇÃO',
    'EM PRODUÇÃO': 'EM PRODUÇÃO',
    'EM PRODUÇÃO/TRÂNSITO': 'EM PRODUÇÃO / TRÂNSITO',
    'PRODUCTION COMPLETED / READY FOR DELIVERY': 'PRODUÇÃO CONCLUÍDA / PRONTO PARA ENTREGA',
    'READY FOR DELIVERY': 'PRONTO PARA ENTREGA',
    'DELIVERY SCHEDULED': 'ENTREGA AGENDADA',
    'ENTREGA AGENDADA': 'ENTREGA AGENDADA',
    'OUT FOR DELIVERY': 'A CAMINHO / SAIU PARA ENTREGA',
    'EM TRÂNSITO': 'A CAMINHO / SAIU PARA ENTREGA',
    'PRESTES A CHEGAR': 'PRESTES A CHEGAR',
    'DELIVERED': 'ENTREGUE',
    'ENTREGUE': 'ENTREGUE',
    'CANCELLED': 'CANCELADO',
    'CANCELADO': 'CANCELADO',
  };

  if (language === 'en') {
    return statusMapEn[s] || status;
  }
  return statusMapPt[s] || status;
}

export function formatDeliveryWindow(windowStr?: string | null, language: 'pt' | 'en' = 'pt'): string {
  if (!windowStr) return '';
  const lower = windowStr.toLowerCase();
  if (lower.includes('manh') || lower.includes('morn')) {
    return language === 'en' ? 'Morning (09:00 - 13:00)' : 'Manhã (09:00 - 13:00)';
  }
  if (lower.includes('tarde') || lower.includes('aftern')) {
    return language === 'en' ? 'Afternoon (14:00 - 18:00)' : 'Tarde (14:00 - 18:00)';
  }
  if (lower.includes('final') || lower.includes('even')) {
    return language === 'en' ? 'Evening (18:00 - 20:00)' : 'Final de Tarde (18:00 - 20:00)';
  }
  return windowStr;
}

export function getProductReturnDateDisplay(product?: { badge?: string | null; return_date?: string } | null): string | null {
  if (!product || !isComingBackSoonBadge(product.badge)) return null;
  if (!product.return_date || product.return_date.trim() === '') return null;
  return product.return_date.trim();
}
