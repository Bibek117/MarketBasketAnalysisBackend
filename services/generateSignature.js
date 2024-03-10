import CryptoJs from 'crypto-js';

const generateSign = (msg) =>{
    const hash = CryptoJs.HmacSHA256(msg, process.env.ESEWA_SECRET);
    const hasedInBase64 = CryptoJs.enc.Base64.stringify(hash);
    return hasedInBase64;
}
export default generateSign;