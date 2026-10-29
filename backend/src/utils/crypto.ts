import crypto from 'crypto-js';

const Crypto = {
  decrypt: (encryptedText: string, password: string): string | null => {
    try {
      const bytes = crypto.AES.decrypt(encryptedText, password),
        decrypted = bytes.toString(crypto.enc.Utf8);
      if (decrypted === '') {
        return null;
      }
      return decrypted;
    } catch {
      return null;
    }
  },

  encrypt: (clearText: string, password: string): string =>
    crypto.AES.encrypt(clearText, password).toString(),
};

export default Crypto;
