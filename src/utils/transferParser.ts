import { ForceIncomeType, IncomeSource, PaymentPlatform } from '../types/finance';

export interface ParsedTransferResult {
  rawText: string;
  amount: number;
  platform: PaymentPlatform;
  source: IncomeSource;
  forceType?: ForceIncomeType;
  memberName?: string;
  productTag?: string;
  confidence: number;
  suggestedNote: string;
}

export function parseTransferText(rawInput: string): ParsedTransferResult | null {
  if (!rawInput || rawInput.trim().length === 0) return null;

  const text = rawInput.trim();
  const lower = text.toLowerCase();

  // 1. Detect Platform
  let platform: PaymentPlatform = 'mercadopago';
  if (lower.includes('galicia') || lower.includes('banco galicia')) {
    platform = 'galicia';
  } else if (lower.includes('cuenta dni') || lower.includes('bapro')) {
    platform = 'cuenta_dni';
  } else if (lower.includes('lemon') || lower.includes('lemon cash')) {
    platform = 'lemon';
  } else if (lower.includes('mercado pago') || lower.includes('mercadopago') || lower.includes('mp')) {
    platform = 'mercadopago';
  }

  // 2. Extract Amount
  // Matches: $ 45.000,00 | $45.000 | $ 2.600 | 45000 | 29.000
  const amountRegex = /(?:\$|\bars?\b)?\s*([0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]{2})?|[0-9]+(?:,[0-9]{2})?)/i;
  const amountMatch = text.match(amountRegex);

  let amount = 0;
  if (amountMatch && amountMatch[1]) {
    let cleanStr = amountMatch[1].replace(/\./g, '').replace(',', '.');
    amount = parseFloat(cleanStr) || 0;
  }

  // Fallback: search for numbers >= 1000
  if (amount === 0) {
    const rawNumberMatch = text.match(/\b([1-9][0-9]{3,7})\b/);
    if (rawNumberMatch && rawNumberMatch[1]) {
      amount = parseFloat(rawNumberMatch[1]) || 0;
    }
  }

  // 3. Extract Sender / Member Name
  let memberName: string | undefined;
  const senderPatterns = [
    /(?:de|from|por|de parte de)\s+([A-ZÁÉÍÓÚa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚa-záéíóúñ]+)?)/i,
    /(?:recibiste|received|transferencia recibida de|te transfirió)\s+([A-ZÁÉÍÓÚa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚa-záéíóúñ]+)?)/i,
  ];

  for (const pattern of senderPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ignore false positives
      if (!['galicia', 'mercadopago', 'lemon', 'cuenta', 'dni', 'banco', 'transferencia', 'dinero', 'pago'].includes(candidate.toLowerCase())) {
        memberName = candidate;
        break;
      }
    }
  }

  // 4. Classify Source & Income Type (Assurant vs Force Gym)
  let source: IncomeSource = 'force_gym';
  let forceType: ForceIncomeType | undefined = 'cuota';
  let productTag: string | undefined;

  if (lower.includes('assurant') || lower.includes('sueldo') || lower.includes('haberes') || amount >= 800000) {
    source = 'assurant';
    forceType = undefined;
  } else {
    source = 'force_gym';
    // Check if supplement mentioned
    if (lower.includes('creatina') || lower.includes('creatine')) {
      forceType = 'suplemento';
      productTag = 'Creatine Monohydrate (300g)';
    } else if (lower.includes('proteina') || lower.includes('protein') || lower.includes('whey')) {
      forceType = 'suplemento';
      productTag = 'Whey Protein (1kg)';
    } else if (lower.includes('barra') || lower.includes('bar')) {
      forceType = 'suplemento';
      productTag = 'Protein Bar';
    } else if (lower.includes('pre entreno') || lower.includes('pre workout')) {
      forceType = 'suplemento';
      productTag = 'Explosive Pre-Workout';
    } else if (amount >= 40000) {
      // Force Gym Cuotas start at $45,000
      forceType = 'cuota';
    } else {
      // Below cuota threshold -> likely supplement
      forceType = 'suplemento';
      productTag = 'Supplement Sale';
    }
  }

  const confidence = (amount > 0 ? 0.5 : 0) + (memberName ? 0.3 : 0) + (platform ? 0.2 : 0);

  const suggestedNote = source === 'assurant'
    ? 'Corporate Base Salary'
    : forceType === 'cuota'
      ? `Force Gym Monthly Due ${memberName ? `- ${memberName}` : ''}`
      : `Force Gym Supplement Sale ${productTag ? `(${productTag})` : ''}`;

  return {
    rawText: rawInput,
    amount,
    platform,
    source,
    forceType,
    memberName,
    productTag,
    confidence,
    suggestedNote,
  };
}
