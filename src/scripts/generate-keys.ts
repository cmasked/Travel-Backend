/**
 * Generate RSA-256 keypair for JWT RS256 signing.
 * Run: npx ts-node src/scripts/generate-keys.ts
 *
 * Output: base64-encoded keys ready for .env
 */
import * as crypto from 'crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

console.log('Add these to your .env file:\n');
console.log(`JWT_PRIVATE_KEY=${Buffer.from(privateKey).toString('base64')}`);
console.log('');
console.log(`JWT_PUBLIC_KEY=${Buffer.from(publicKey).toString('base64')}`);
