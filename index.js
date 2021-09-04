'use strict'
const crypto = require('crypto')

function base64UrlEncode(str) {
  return urlEncodeBase64(Buffer.from(str, 'utf8').toString('base64'))
}

function urlEncodeBase64(base64) {
  return base64.replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}


function encodePart(obj) {
  return base64UrlEncode(JSON.stringify(obj))
}

function decodePart(str) {
  if(!str) return null
  return Buffer.from(str, 'base64').toString('utf8')
}


function jt(header, payload, secret) {
  if(!header || !secret) return null
  header = encodePart(header)
  payload = encodePart(payload)
  let jt_ = `${header}.${payload}`
  const sig = urlEncodeBase64(crypto.createHmac('sha256', secret).update(jt_).digest('base64'))
  return `${jt_}.${sig}`
}

function decode(token, cb) {
  try {
    if(!token) return cb()
    const hps = token.split('.')
    if(hps.length !== 3) return cb("invalid format")
    const header = JSON.parse(decodePart(hps[0]))
    const payload = JSON.parse(decodePart(hps[1]))
    const signature = decodePart(hps[2])
    cb(null, header, payload, signature)
  } catch(e) {
    cb("invalid format")
  }
}

jt.decode = decode

module.exports = jt
