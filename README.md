# JT - Simpler, more secure Json Web Token

![icon](./jt.png)

The [JSON web token (JWT)](https://jwt.io/) is a very nice way of sharing information securely between services in a web app. However, it currently suffers f[rom a couple of security issues](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/) that make it less secure than needed.

Also the [JSON web token (JWT)](https://jwt.io/) standard is very well documented and really easy to implement, so this is the implementation that removes the discussed security flaws.

## JT Structure

The JT Structure consists of three parts separated by dots (`.`), which are:

* Header
* Payload
* Signature

Therefore, a JT typically looks like the following:

`xxxx.yyyy.zzzz`

Let’s break down the different parts.

### Header

The header consists of the meta data about the token. Specifically the following fields:

```
{
  iss: <issuer>,
  sub: <subject>,
  exp: <expiration>,
}
```

All of which are **mandatory** and used to validate the token. Any additional fields can also be added if desired. Then, this JSON is **Base64Url** encoded to form the first part of the JT.

### Payload

The second part of the token is the actual payload - the data that the token contains.

An example payload could be:

```javascript
{
  name: "ralph rambo",
  pic: "https://pics.com/ralph-profile-pic.png",
  tz: "UTC−03"
}
```

The payload is then **Base64Url** encoded to form the second part of the JT.

> Do note that for signed tokens this information, though protected against tampering, is readable by anyone. Do not put secret information in the payload or header elements of a JT unless it is encrypted.

### Signature

To create the signature part we take the encoded header, the encoded payload, a secret and sign that using HMAC SHA256.

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

The signature is used to verify the message wasn't changed along the way, and, in the case of tokens signed with a private key, it can also verify that the sender of the JT is who it says it is.

## Putting all together

The output is three Base64-URL strings separated by dots that can be easily passed in HTML and HTTP environments and easy to use and understand.

## Usage

Creating the token

```javascript
const jt = require("@tpp/jt")

const token = jt({
  iss: "authSvc",
  sub: "userRoles",
  exp: 1630730447160,
}, {
  name: "Ralph Rambo"
  roles: ["badass"],
},
"my secret key")
```

Getting valid token data

```javascript
jt.check(token, "my secret key", (err, payload, header) => ...)
jt.check(token, "my secret key", "authSvc", (err, payload, header) => ...)
jt.check(token, "my secret key", "authSvc", "userRoles", (err, payload, header) => ...)

// err => null (ok)
         "invalid header"
         "invalid format"
         "invalid signature"
         "expired"
         "bad issuer"
         "bad subject"
// payload => { name: "Ralph Rambo", roles: ["badass"] }
// header => { iss: "authSvc", sub: "userRoles", exp: 1630730447160 }
```

You can also simply decode the token without checking it if desired:

```javascript
jt.decode(token, (err, payload, header) => ...)
```

