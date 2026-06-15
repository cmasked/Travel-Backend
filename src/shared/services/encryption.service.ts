import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decrypt, encrypt } from '../utils/encryption.util';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(plaintext: string): string {
    return encrypt(plaintext, this.getKey());
  }

  decrypt(encryptedBase64: string): string {
    return decrypt(encryptedBase64, this.getKey());
  }

  private getKey(): Buffer {
    const key = this.configService.get<string>('encryption.key');
    if (!key || key.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }

    return Buffer.from(key, 'hex');
  }
}
