import crypto from 'crypto'

const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'
const IV_LENGTH = 16

export const encrypt = (text) => {
  let iv = crypto.randomBytes(IV_LENGTH)
  let cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export const decrypt = (text) => {
  let textParts = text.split(':')
  let iv = Buffer.from(textParts.shift(), 'hex')
  let encryptedText = Buffer.from(textParts.join(':'), 'hex')
  let decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
