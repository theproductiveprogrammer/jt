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
  let enc = `${header}.${payload}`
  const sig = getSig(enc, secret)
  return `${enc}.${sig}`
}

function getSig(enc, secret) {
  return urlEncodeBase64(crypto.createHmac('sha256', secret).update(enc).digest('base64'))
}

function decode(token, cb) {
  if(!token) return cb()
  const hps = token.split('.')
  if(hps.length !== 3) return cb("invalid format")

  let header
  let payload
  let signature
  try {
    header = JSON.parse(decodePart(hps[0]))
    payload = JSON.parse(decodePart(hps[1]))
    signature = decodePart(hps[2])
  } catch(e) {
    return cb("invalid format")
  }

  cb(null, header, payload, signature)
}

function check(token, secret, cb_) {
  decode(token, (err, header, payload, signature) => {
    if(err) return cb_(err, header, payload)
    const ndx = token.lastIndexOf('.')
    const enc = token.substring(0, ndx)
    const sig = token.substring(ndx+1)
    const ver = getSig(enc, secret)
    if(ver !== sig) return cb_("invalid signature", header, payload)
    return cb_(null, header, payload)
  })
}

jt.decode = decode
jt.check = check

module.exports = jt
