import { apiRequest } from '@/services/api';
import type {
  Asset,
  CollateralPosition,
  CreditAccount,
  Merchant,
  PaymentIntent,
  PoolAdvance,
  ReceivableNote,
  Statement,
  StatementItem,
  User,
  Wallet,
} from '@/types/backend';

// ========== Auth ==========

export interface SignupRequest {
  email: string;
  name: string;
  phone?: string;
  password?: string;
}

export interface AuthResponse {
  userId: string;
  token: string;
}

export const AuthApi = {
  signup: (body: SignupRequest) =>
    apiRequest<AuthResponse>('auth/signup', { method: 'POST', body, skipAuth: true }),
  login: (body: { email: string; password: string }) =>
    apiRequest<AuthResponse>('auth/login', { method: 'POST', body, skipAuth: true }),
  me: () => apiRequest<User>('auth/me'),
};

// ========== Accounts ==========

export const AccountsApi = {
  create: () => apiRequest<{ userId: string; walletId: string; pubkey: string; note?: string }>('accounts', { method: 'POST' }),
};

// ========== Users ==========

export const UsersApi = {
  createWallet: (userId: string) =>
    apiRequest<{ ok: boolean; userId: string; walletId: string; pubkey: string }>(`users/${userId}/wallet`, { method: 'POST' }),
  getScore: (userId: string) =>
    apiRequest<{ userId: string; score: number; method: string; confirmedPurchases: number }>(`users/${userId}/score`),
};

// ========== Credit ==========

export const CreditApi = {
  open: (ownerPubkey: string) =>
    apiRequest<{ creditPda: string }>('credit/open', { method: 'POST', body: { ownerPubkey } }),
  setLimit: (ownerPubkey: string, newLimitUsdc: number) =>
    apiRequest<{ ok: boolean }>('credit/limit', { method: 'POST', body: { ownerPubkey, newLimitUsdc } }),
  charge: (ownerPubkey: string, amountUsdc: number, installments: number, orderIdHex: string) =>
    apiRequest<{ ok: boolean }>('credit/charge', {
      method: 'POST',
      body: { ownerPubkey, amountUsdc, installments, orderIdHex },
    }),
  repay: (ownerPubkey: string, amountUsdc: number) =>
    apiRequest<{ ok: boolean }>('credit/repay', {
      method: 'POST',
      body: { ownerPubkey, amountUsdc },
    }),
  openAsAdmin: () => apiRequest<{ creditPda: string; owner: string }>('credit/open/admin', { method: 'POST' }),
  getAccount: (ownerPubkey: string) => apiRequest<{
    owner: string;
    creditPda: string;
    onchain?: Record<string, unknown>;
    database?: CreditAccount | null;
    error?: string;
  }>(`credit/${ownerPubkey}`),
  prepareOpen: (ownerPubkey: string) =>
    apiRequest<{ serialized: string; latestBlockhash: string; feePayer: string }>('credit/prepare/open', {
      method: 'POST',
      body: { ownerPubkey },
    }),
};

// ========== Collateral ==========

export const CollateralApi = {
  openPosition: (ownerPubkey: string, mint: string) =>
    apiRequest('collateral/open-position', { method: 'POST', body: { ownerPubkey, mint } }),
  deposit: (ownerPubkey: string, mint: string, amount: number) =>
    apiRequest('collateral/deposit', { method: 'POST', body: { ownerPubkey, mint, amount } }),
  withdraw: (ownerPubkey: string, mint: string, amount: number) =>
    apiRequest('collateral/withdraw', { method: 'POST', body: { ownerPubkey, mint, amount } }),
  initVaultConfig: () =>
    apiRequest('collateral/init/vault-config', { method: 'POST' }),
  initVault: (mint: string) =>
    apiRequest('collateral/init/vault', { method: 'POST', body: { mint } }),
  depositAsAdmin: (mint: string, amount: number) =>
    apiRequest('collateral/deposit/admin', { method: 'POST', body: { mint, amount } }),
  getPositions: (owner: string) =>
    apiRequest<CollateralPosition[]>(`collateral/${owner}`),
  getPosition: (owner: string, mint: string) =>
    apiRequest<CollateralPosition>(`collateral/${owner}/${mint}`),
  prepareOpen: (ownerPubkey: string, mint: string) =>
    apiRequest('collateral/prepare/open-position', { method: 'POST', body: { ownerPubkey, mint } }),
  prepareDeposit: (ownerPubkey: string, mint: string, amount: number) =>
    apiRequest('collateral/prepare/deposit', { method: 'POST', body: { ownerPubkey, mint, amount } }),
  prepareWithdraw: (ownerPubkey: string, mint: string, amount: number) =>
    apiRequest('collateral/prepare/withdraw', { method: 'POST', body: { ownerPubkey, mint, amount } }),
};

// ========== Oracle ==========

export const OracleApi = {
  setPumpClass: (payload: { maxLtv: number; haircut: number; minHolding: number }) =>
    apiRequest('oracle/pump/class', { method: 'POST', body: payload }),
  setPumpToken: (payload: { mint: string; basePrice: number; volatilityFactor: number }) =>
    apiRequest('oracle/pump/token', { method: 'POST', body: payload }),
  updatePrice: (payload: { mint: string; price: number }) =>
    apiRequest('oracle/pump/price', { method: 'POST', body: payload }),
  getPumpClassInfo: () => apiRequest<Record<string, unknown>>('oracle/pump/class'),
  getPumpTokenInfo: (mint: string) => apiRequest<Record<string, unknown>>(`oracle/pump/token/${mint}`),
  getPrice: (mint: string) => apiRequest<{ mint: string; price: number; ts: string }>(`oracle/price/${mint}`),
  getAssets: (type?: string) => apiRequest<Asset[]>('oracle/assets', { query: { type } }),
};

// ========== Pool ==========

export const PoolApi = {
  getPoolInfo: (adminPubkey: string) => apiRequest<Record<string, unknown>>(`pool/${adminPubkey}`),
  getAdvanceHistory: (poolPda?: string) =>
    apiRequest<PoolAdvance[]>('pool/advances/history', { query: { poolPda } }),
  getAdvanceByNote: (notePda: string) =>
    apiRequest<PoolAdvance>(`pool/advances/note/${notePda}`),
  initPool: () => apiRequest('pool/init', { method: 'POST' }),
  replenishReserve: (amount: number) =>
    apiRequest('pool/replenish', { method: 'POST', body: { amount } }),
  advanceNote: (notePda: string) =>
    apiRequest('pool/advance', { method: 'POST', body: { notePda } }),
  guaranteeSettle: (notePda: string) =>
    apiRequest('pool/guarantee-settle', { method: 'POST', body: { notePda } }),
  prepareInit: (adminPubkey: string) =>
    apiRequest('pool/prepare/init', { method: 'POST', body: { adminPubkey } }),
  prepareReplenish: (adminPubkey: string, amount: number) =>
    apiRequest('pool/prepare/replenish', { method: 'POST', body: { adminPubkey, amount } }),
  prepareAdvance: (adminPubkey: string, notePda: string) =>
    apiRequest('pool/prepare/advance', { method: 'POST', body: { adminPubkey, notePda } }),
  prepareGuaranteeSettle: (adminPubkey: string, notePda: string) =>
    apiRequest('pool/prepare/guarantee-settle', { method: 'POST', body: { adminPubkey, notePda } }),
};

// ========== Receivables ==========

export const ReceivablesApi = {
  mint: (payload: { orderId: string; index: number; buyer: string; merchant: string; amountUsdc: number; dueTs: string }) =>
    apiRequest('receivables/mint', { method: 'POST', body: payload }),
  prepareMint: (payload: { payerPubkey: string; orderId: string; index: number; buyer: string; merchant: string; amountUsdc: number; dueTs: string }) =>
    apiRequest('receivables/prepare/mint', { method: 'POST', body: payload }),
  mintForCharge: (payload: { buyer: string; merchant: string; totalAmount: number; installments: number; orderId: string }) =>
    apiRequest('receivables/mint-for-charge', { method: 'POST', body: payload }),
  getNote: (orderId: string, index: number) =>
    apiRequest<ReceivableNote>(`receivables/note/${orderId}/${index}`),
  getByBuyer: (buyer: string) =>
    apiRequest<ReceivableNote[]>(`receivables/buyer/${buyer}`),
  getByMerchant: (merchantId: string) =>
    apiRequest<ReceivableNote[]>(`receivables/merchant/${merchantId}`),
  getByStatus: (status: string) =>
    apiRequest<ReceivableNote[]>(`receivables/status/${status}`),
};

// ========== Statements ==========

export const StatementsApi = {
  generate: (payload: { ownerPubkey: string; cycleId: string }) =>
    apiRequest('statements/generate', { method: 'POST', body: payload }),
  generateAll: () => apiRequest('statements/generate/all', { method: 'POST' }),
  get: (id: string) => apiRequest<Statement>(`statements/${id}`),
  getByOwner: (ownerPubkey: string) =>
    apiRequest<Statement[]>(`statements/owner/${ownerPubkey}`),
  getLatest: (ownerPubkey: string) =>
    apiRequest<Statement>(`statements/owner/${ownerPubkey}/latest`),
  addItem: (statementId: string, payload: { type: string; amountUsdc: number; metaJson: Record<string, unknown> }) =>
    apiRequest<StatementItem>(`statements/${statementId}/items`, { method: 'POST', body: payload }),
};

// ========== Reports ==========

export const ReportsApi = {
  exportSalesCsv: (params: { merchantId?: string; startDate?: string; endDate?: string }) =>
    apiRequest<string>('reports/sales/csv', { query: params, responseType: 'text' }),
  exportReceivablesCsv: (params: { merchantId?: string; status?: string }) =>
    apiRequest<string>('reports/receivables/csv', { query: params, responseType: 'text' }),
  exportAdvancesCsv: (params: { merchantId?: string }) =>
    apiRequest<string>('reports/advances/csv', { query: params, responseType: 'text' }),
  getMerchantMetrics: (merchantId: string) =>
    apiRequest<Record<string, unknown>>('reports/merchant/:id/metrics', { query: { id: merchantId } }),
  getGlobalMetrics: () => apiRequest<Record<string, unknown>>('reports/global/metrics'),
  getSalesChart: (params: { merchantId?: string; days?: number }) =>
    apiRequest<Record<string, unknown>>('reports/sales/chart', { query: params }),
};

// ========== Merchants ==========

export interface MerchantCreateRequest {
  name: string;
  email: string;
  phone?: string;
  cnpj?: string;
  category?: string;
  callbackUrl?: string;
  takeRateBps?: number;
  maxInstallments?: number;
  minTicket?: number;
}

export const MerchantsApi = {
  create: (body: MerchantCreateRequest, adminApiKey: string) =>
    apiRequest<{ merchantId: string; apiKey: string }>('merchants', {
      method: 'POST',
      body,
      headers: { 'x-api-key': adminApiKey },
    }),
  get: (id: string) => apiRequest<Merchant>(`merchants/${id}`),
  rotateKey: (id: string, adminApiKey: string) =>
    apiRequest<{ merchantId: string; apiKey: string }>(`merchants/${id}/rotate-key`, {
      method: 'POST',
      headers: { 'x-api-key': adminApiKey },
    }),
  sales: (id: string, apiKey: string, params?: { status?: string; from?: string; to?: string }) =>
    apiRequest<PaymentIntent[]>(`merchants/${id}/sales`, {
      query: params,
      headers: { 'x-merchant-key': apiKey },
    }),
  metrics: (id: string, apiKey: string, params?: { from?: string; to?: string }) =>
    apiRequest<Record<string, unknown>>(`merchants/${id}/metrics`, {
      query: params,
      headers: { 'x-merchant-key': apiKey },
    }),
  reportCsv: (id: string, apiKey: string, params?: { from?: string; to?: string }) =>
    apiRequest<string>(`merchants/${id}/reports`, {
      query: params,
      headers: { 'x-merchant-key': apiKey },
      responseType: 'text',
    }),
  advance: (id: string, apiKey: string, body?: { minNetUsdc?: number }) =>
    apiRequest(`merchants/${id}/advance`, {
      method: 'POST',
      headers: { 'x-merchant-key': apiKey },
      body,
    }),
};

// ========== Jobs ==========

export const JobsApi = {
  run: (jobName: string) => apiRequest<{ message: string; jobName: string; timestamp: string }>(`jobs/run/${jobName}`, { method: 'POST' }),
  list: () => apiRequest<{ jobs: Array<{ name: string; description: string; schedule: string }> }>('jobs/list'),
  runs: (params?: { jobName?: string; limit?: number }) =>
    apiRequest<{ runs: Array<Record<string, unknown>>; count: number }>('jobs/runs', { query: params }),
  runDetails: (id: string) => apiRequest<{ run?: Record<string, unknown>; error?: string }>(`jobs/runs/${id}`),
};

// ========== Intents ==========

export const IntentsApi = {
  createQr: (merchantId: string, apiKey: string, payload: Record<string, unknown>) =>
    apiRequest(`merchants/${merchantId}/qrs`, {
      method: 'POST',
      headers: { 'x-merchant-key': apiKey },
      body: payload,
    }),
  get: (id: string) => apiRequest<Record<string, unknown>>(`intents/${id}`),
  confirm: (id: string, payload: { ownerPubkey: string; orderIdExt?: string }) =>
    apiRequest<Record<string, unknown>>(`intents/${id}/confirm`, { method: 'POST', body: payload }),
  cancel: (merchantId: string, intentId: string, apiKey: string) =>
    apiRequest<Record<string, unknown>>(`merchants/${merchantId}/intents/${intentId}/cancel`, {
      method: 'POST',
      headers: { 'x-merchant-key': apiKey },
    }),
};

// ========== Admin ==========

export const AdminApi = {
  updateCreditConfig: (payload: Record<string, unknown>, adminApiKey: string) =>
    apiRequest('admin/credit/config', {
      method: 'POST',
      body: payload,
      headers: { 'x-api-key': adminApiKey },
    }),
  reindex: (payload: Record<string, unknown>, adminApiKey: string) =>
    apiRequest('admin/reindex', {
      method: 'POST',
      body: payload,
      headers: { 'x-api-key': adminApiKey },
    }),
  clearCache: (type: 'events' | 'prices' | 'all', adminApiKey: string) =>
    apiRequest('admin/cache/clear', {
      method: 'POST',
      body: { type },
      headers: { 'x-api-key': adminApiKey },
    }),
  getCreditConfig: () => apiRequest<Record<string, unknown>>('admin/credit/config'),
  getJobRuns: (params?: { jobName?: string; limit?: number }) =>
    apiRequest<{ jobs: Array<Record<string, unknown>> }>('admin/jobs/runs', { query: params }),
  getStats: () => apiRequest<Record<string, unknown>>('admin/stats'),
  getAuditByEntity: (entity: string, entityId: string, params?: { limit?: number }) =>
    apiRequest<{ entity: string; entityId: string; logs: Array<Record<string, unknown>>; count: number }>(
      `admin/audit/entity/${entity}/${entityId}`,
      { query: params },
    ),
  getAuditByActor: (actorType: string, actorId: string, params?: { limit?: number }) =>
    apiRequest<{ actorType: string; actorId: string; logs: Array<Record<string, unknown>>; count: number }>(
      `admin/audit/actor/${actorType}/${actorId}`,
      { query: params },
    ),
  getRecentAudit: (params?: { limit?: number }) =>
    apiRequest<{ logs: Array<Record<string, unknown>>; count: number }>('admin/audit/recent', { query: params }),
};

// ========== Webhooks ==========

export const WebhooksApi = {
  helius: (payload: Record<string, unknown>) =>
    apiRequest('webhooks/solana', { method: 'POST', body: payload }),
  merchant: (payload: { merchantId: string; event: string; data: Record<string, unknown> }) =>
    apiRequest('webhooks/merchant', { method: 'POST', body: payload }),
  list: (params?: { target?: string; limit?: number }) =>
    apiRequest<Array<Record<string, unknown>>>('webhooks/list', { query: params }),
  retry: (id: string) => apiRequest(`webhooks/retry/${id}`, { method: 'POST' }),
};

// ========== Utility ==========

export const RootApi = {
  health: () => apiRequest<string>('', { responseType: 'text' }),
};
