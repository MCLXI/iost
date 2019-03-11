import crypto from 'crypto';


const utils = {
  aesEncrypt(data, key){
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  aesDecrypt(encrypted, key){
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },
  delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




// var data = 'Hello, this is a secret message!';
// var key = 'Password!';
// var encrypted = utils.aesEncrypt(data, key);
// var decrypted = utils.aesDecrypt(encrypted, key);
 
// console.log('Plain text: ' + data);
// console.log('Encrypted text: ' + encrypted);
// console.log('Decrypted text: ' + decrypted);


export default utils