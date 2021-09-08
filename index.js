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


function token(header, payload, secret, cb) {
  if(!header) return cb("missing header")
  if(!secret) return cb("missing secret")
  if(!header.iss) return cb("missing issuer (iss)")
  if(!header.sub) return cb("missing subject (sub)")
  if(!header.exp) return cb("missing expiry (exp)")
  header = encodePart(header)
  payload = encodePart(payload)
  let enc = `${header}.${payload}`
  const sig = getSig(enc, secret)
  cb(null, `${enc}.${sig}`)
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

  cb(null, payload, header, signature)
}

function check(token, secret, iss, sub, cb_) {
  if(typeof iss === 'function') {
    cb_ = iss
    iss = null
    sub = null
  }
  if(typeof sub === 'function') {
    cb_ = sub
    sub = null
  }
  decode(token, (err, payload, header, signature) => {
    if(err) return cb_(err, payload, header)
    if(!header) return cb_("invalid header", payload)
    const ndx = token.lastIndexOf('.')
    const enc = token.substring(0, ndx)
    const sig = token.substring(ndx+1)
    const ver = getSig(enc, secret)
    if(ver !== sig) return cb_("invalid signature", payload, header)
    if(iss && iss !== header.iss) return cb_("bad issuer", payload, header)
    if(sub && sub !== header.sub) return cb_("bad subject", payload, header)
    if(Date.now() > header.exp) return cb_("expired", payload, header)
    return cb_(null, payload, header)
  })
}

module.exports = {
  token,
  decode,
  check,
  exp: {
    ms: t => Date.now() + t,

    sec: t => Date.now() + t * 1000,
    secs: t => Date.now() + t * 1000,

    min: t => Date.now() + t * 1000 * 60,
    mins: t => Date.now() + t * 1000 * 60,

    hr: t => Date.now() + t * 1000 * 60 * 60,
    hrs: t => Date.now() + t * 1000 * 60 * 60,
    hours: t => Date.now() + t * 1000 * 60 * 60,

    day: t => Date.now() + t * 1000 * 60 * 60 * 24,
    days: t => Date.now() + t * 1000 * 60 * 60 * 24,
  }
}
