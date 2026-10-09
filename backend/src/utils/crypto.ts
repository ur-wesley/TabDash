import crypto from 'crypto-js';

const Crypto = {
  decrypt(encryptedText: string, password: string) {
    try {
      const bytes = crypto.AES.decrypt(encryptedText, password);
      const decrypted = bytes.toString(crypto.enc.Utf8);
      return decrypted || null;
    } catch {
      return null;
    }
  },

  encrypt(clearText: string, password: string) {
    return crypto.AES.encrypt(clearText, password).toString();
  },
};
export default Crypto;
