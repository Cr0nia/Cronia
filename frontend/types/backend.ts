export interface Wallet {
  id: string;
  userId?: string | null;
  pubkey: string;
  aaRef?: string | null;
  custodied: boolean;
  skEncrypted?: string | null;
  createdAt: string;
}

export interface CreditAccount {
  ownerPubkey: string;
  limitUsdc: number;
  usedUsdc: number;
  healthFactor: number;
  score: number;
  billingDay: number;
  status: string;
  updatedAt: string;
  userId?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  kycLevel: number;
  status: string;
  createdAt: string;
  wallets: Wallet[];
  creditAccount?: CreditAccount | null;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cnpj?: string | null;
  category?: string | null;
  callbackUrl?: string | null;
  takeRateBps: number;
  maxInstallments: number;
  minTicket: number;
  verified: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  merchantId: string;
  amountUsdc: number;
  currency: string;
  description?: string | null;
  maxInstallments: number;
  status: string;
  ownerPubkey?: string | null;
  orderIdExt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface ReceivableNote {
  notePda: string;
  buyer: string;
  merchantId: string;
  beneficiary: string;
  amountUsdc: number;
  dueTs: string;
  status: string;
  orderId: string;
  createdAt: string;
  saleId?: string | null;
}

export interface StatementItem {
  id: string;
  statementId: string;
  type: string;
  amountUsdc: number;
  metaJson: Record<string, unknown>;
}

export interface Statement {
  id: string;
  ownerPubkey: string;
  cycleId: string;
  closeTs: string;
  totalDue: number;
  minPayment: number;
  items: StatementItem[];
}

export interface PoolAdvance {
  id: string;
  notePda: string;
  poolPda: string;
  grossUsdc?: number | null;
  discountUsdc?: number | null;
  netUsdc?: number | null;
  txSignature?: string | null;
  status: string;
  createdAt: string;
}

export interface CollateralPosition {
  id: string;
  ownerPubkey: string;
  mint: string;
  amount: number;
  valuation: number;
  ltvBps: number;
  updatedAt: string;
}

export interface Asset {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  type: string;
  defaultLtvBps: number;
  haircutBps: number;
}

export interface Price {
  id: string;
  mint: string;
  priceUsdc: number;
  lastTs: string;
}
