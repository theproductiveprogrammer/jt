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

function jt(header, payload, secret) {
  if(!header || !secret) return null
  header = encodePart(header)
  payload = encodePart(payload)
  let jt_ = `${header}.${payload}`
  const sig = urlEncodeBase64(crypto.createHmac('sha256', secret).update(jt_).digest('base64'))
  return `${jt_}.${sig}`
}
module.exports = jt
