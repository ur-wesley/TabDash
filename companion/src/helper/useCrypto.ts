import Crypto from "crypto-js";

export default class {
  encrypt(clearText: string, password: string) {
    return Crypto.AES.encrypt(clearText, password).toString();
  }

  decrypt(encryptedText: string, password: string) {
    try {
      const bytes = Crypto.AES.decrypt(encryptedText, password);
      return bytes.toString(Crypto.enc.Utf8);
    } catch {
      return "decrypt failed";
    }
  }
}
