import { Keypair } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';

// Exemplo de como assinar uma mensagem com um keypair Solana

async function testSignMessage() {
  // 1. Gerar um keypair de teste (ou use um existente)
  const keypair = Keypair.generate();
  const walletAddress = keypair.publicKey.toString();

  console.log('🔑 Wallet Address:', walletAddress);
  console.log('📝 Secret Key (Base58):', bs58.encode(keypair.secretKey));
  console.log('');

  // 2. Simular a mensagem do challenge (você recebe isso da API)
  const message = `localhost wants you to sign in with your Solana account:
${walletAddress}

Sign in to Cronia

URI: http://localhost:3000
Version: 1
Chain ID: solana:devnet
Nonce: q0fhu01x0nfhwwxwtmljq
Issued At: 2025-10-21T00:45:47.300Z`;

  console.log('📄 Message to sign:');
  console.log(message);
  console.log('');

  // 3. Assinar a mensagem
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = sign.detached(messageBytes, keypair.secretKey);
  const signatureBase58 = bs58.encode(signatureBytes);

  console.log('✍️  Signature (Base58):', signatureBase58);
  console.log('');

  // 4. Verificar a assinatura (simular o que o backend faz)
  const isValid = sign.detached.verify(
    messageBytes,
    signatureBytes,
    keypair.publicKey.toBytes()
  );

  console.log('✅ Signature valid:', isValid);
  console.log('');

  // 5. Payload para enviar ao /v1/auth/verify
  const verifyPayload = {
    walletAddress,
    message,
    signature: signatureBase58,
    userType: 'consumer'
  };

  console.log('📤 Payload to send to /v1/auth/verify:');
  console.log(JSON.stringify(verifyPayload, null, 2));
}

testSignMessage().catch(console.error);
