import CryptoJS from "crypto-js";

function getValidKey(key: string) {
  let sTemp;
  if (key.length > 24) {
    sTemp = key.substring(0, 24);
  } else {
    sTemp = key;
    while (sTemp.length !== 24) {
      sTemp += " ";
    }
  }
  return CryptoJS.enc.Utf8.parse(sTemp);
}

function getValidIV(InitVector: string, ValidLength: number) {
  let sTemp;
  if (InitVector.length > ValidLength) {
    sTemp = InitVector.substring(0, ValidLength);
  } else {
    sTemp = InitVector;
    while (sTemp.length !== ValidLength) {
      sTemp += " ";
    }
  }
  return CryptoJS.enc.Utf8.parse(sTemp);
}

export const decryptTripleDES = (
  encryptedSoftpin: string,
  softpinKey: string
) => {
  const key = getValidKey(softpinKey);
  const iv = getValidIV(softpinKey, 8);

  const decrypted = CryptoJS.TripleDES.decrypt(encryptedSoftpin, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  console.log("decrypted", decrypted.toString());
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptTripleDES = (softpin: string, softpinKey: string) => {
  const key = getValidKey(softpinKey);
  const iv = getValidIV(softpinKey, 8);
  const encrypted = CryptoJS.TripleDES.encrypt(softpin, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
};
