import { Keypair } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Script helper para gerar assinaturas para testes no Swagger
 *
 * Como usar:
 * 1. Cole sua chave privada (base58) ou gere uma nova
 * 2. Cole a mensagem recebida do /auth/challenge
 * 3. Execute: npx tsx scripts/sign-message.ts
 */

// Cole aqui a mensagem do /auth/challenge
const message = `localhost wants you to sign in with your Solana account:
3ztkFj5Zk6six7L8BEvdQgW9cpL3m9HvrGh1hjcZUeVe

Sign in to Cronia

URI: http://localhost:3000
Version: 1
Chain ID: solana:devnet
Nonce: z7nesmrmucra62j4fdgfd
Issued At: 2025-10-21T00:58:27.850Z`;

// OPÇÃO 1: Usar uma wallet existente (cole a chave privada base58)
// const privateKeyBase58 = 'COLE_SUA_CHAVE_PRIVADA_AQUI';
// const keypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));

// OPÇÃO 2: Gerar nova wallet (para testes)
const keypair = Keypair.generate();

console.log('='.repeat(80));
console.log('🔑 Wallet Address:');
console.log(keypair.publicKey.toString());
console.log('');

console.log('🔐 Private Key (guarde em segredo!):');
console.log(bs58.encode(keypair.secretKey));
console.log('');

// Assinar a mensagem
const messageBytes = new TextEncoder().encode(message);
const signature = sign.detached(messageBytes, keypair.secretKey);
const signatureBase58 = bs58.encode(signature);

console.log('✍️  Signature:');
console.log(signatureBase58);
console.log('');

// JSON pronto para copiar no Swagger
const verifyPayload = {
  walletAddress: keypair.publicKey.toString(),
  message: message,
  signature: signatureBase58,
  userType: 'consumer'
};

console.log('📋 JSON para o Swagger (copie e cole no /auth/verify):');
console.log(JSON.stringify(verifyPayload, null, 2));
console.log('='.repeat(80));
