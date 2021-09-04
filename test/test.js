'use strict'
const assert = require('assert')

const jt = require('../')

describe("jt", () => {
  describe("jt", () => {

    it("should ignore nulls", () => assert.equal(jt(), null))
    it("should fail if doesn't have enough parameters", () => assert.equal(jt({},{}), null))

    it("should decode an empty payload", done => jt.decode(null, (err, payload, header) => {
      assert.equal(err, null)
      assert.equal(header, null)
      assert.equal(payload, null)
      done()
    }))
    it("should fail with 'invalid format'", done => {
      jt.decode("abc", err => assert.equal(err, "invalid format"))
      done()
    })
    it("should fail with 'invalid format'", done => {
      jt.decode("abc.abc.abc", err => assert.equal(err, "invalid format"))
      done()
    })

    it("should return a valid token with empty payload", () => assert.equal(jt(header1,payload1_empty,secret1), token1))


    const header1 = {
        iss: "authSvc",
        sub: "userRoles",
        exp: 1630730447160,
    }
    const payload1_empty = null
    const secret1 = "my secret key"
    const token1 = "eyJpc3MiOiJhdXRoU3ZjIiwic3ViIjoidXNlclJvbGVzIiwiZXhwIjoxNjMwNzMwNDQ3MTYwfQ.bnVsbA.KbkdXYDFesS0acvAu22t8wi2XASyyhLZUWDTMB9PmUw"
    const tamperedHeader = "eyJpc3MiOiJsaWFyIiwic3ViIjoiaGFja3oiLCJleHAiOjE2MzA3NTE1MjI1Mzd9.bnVsbA.KbkdXYDFesS0acvAu22t8wi2XASyyhLZUWDTMB9PmUw"

    it("should return the empty payload", done => {
      jt.decode(token1, (err, payload, header) => {
        assert.equal(err, null)
        assert.deepEqual(header, header1)
        assert.deepEqual(payload, payload1_empty)
        done()
      })
    })

    it("should be expired", done => {
      jt.check(token1, secret1, (err, payload, header) => {
        assert.equal(err, "expired")
        assert.deepEqual(header, header1)
        assert.deepEqual(payload, payload1_empty)
        done()
      })
    })

    it("should not validate a tampered header", done => {
      jt.check(tamperedHeader, secret1, (err, payload, header) => {
        assert.equal(err, "invalid signature")
        done()
      })
    })

    const header2 = {
        iss: "my new service",
        sub: "my good subjects",
        exp: 2261470482317,
        aud: "my kingdom for a good audience!",
    }
    const payload2 = {
      data: "data 123",
      and: "more data",
      yet: "more and more and more",
      you: "guessed it! - data!"
    }
    const secret2 = "ksauowiehjsdaiur205823075pjda;lfkjs;e9487qjadlfkjas;83q4-0rufjslkdvjd039485j;dklsjqp958aja90438rjfa"
    const token2 = "eyJpc3MiOiJteSBuZXcgc2VydmljZSIsInN1YiI6Im15IGdvb2Qgc3ViamVjdHMiLCJleHAiOjIyNjE0NzA0ODIzMTcsImF1ZCI6Im15IGtpbmdkb20gZm9yIGEgZ29vZCBhdWRpZW5jZSEifQ.eyJkYXRhIjoiZGF0YSAxMjMiLCJhbmQiOiJtb3JlIGRhdGEiLCJ5ZXQiOiJtb3JlIGFuZCBtb3JlIGFuZCBtb3JlIiwieW91IjoiZ3Vlc3NlZCBpdCEgLSBkYXRhISJ9.iDp8CiBMhAY7swCXbxqUavfsWE1ohmXwqARejRV3vzc"

    it("should return a valid token with given payload", () => assert.equal(jt(header2,payload2,secret2), token2))

    it("should return the given payload", done => {
      jt.decode(token2, (err, payload, header) => {
        assert.equal(err, null)
        assert.deepEqual(header, header2)
        assert.deepEqual(payload, payload2)
        done()
      })
    })

    it("should be expired", done => {
      jt.check(token2, secret2, (err, payload, header) => {
        assert.equal(err, null)
        assert.deepEqual(header, header2)
        assert.deepEqual(payload, payload2)
        done()
      })
    })

    it("should validate the issuer", done => {
      jt.check(token2, secret2, header2.iss, (err, payload, header) => {
        assert.equal(err, null)
        assert.deepEqual(header, header2)
        assert.deepEqual(payload, payload2)
        done()
      })
    })

    it("should fail an invalid issuer", done => {
      jt.check(token2, secret2, "fake fake", (err, payload, header) => {
        assert.equal(err, "bad issuer")
        assert.deepEqual(header, header2)
        assert.deepEqual(payload, payload2)
        done()
      })
    })

    it("should validate the subject", done => {
      jt.check(token2, secret2, header2.iss, header2.sub, (err, payload, header) => {
        assert.equal(err, null)
        assert.deepEqual(header, header2)
        assert.deepEqual(payload, payload2)
        done()
      })
    })

    it("should fail an invalid issuer", done => {
      jt.check(token2, secret2, header2.iss, "subject to the law!", (err, payload, header) => {
        assert.equal(err, "bad subject")
        assert.deepEqual(header, header2)
        assert.deepEqual(payload, payload2)
        done()
      })
    })

    const header3 = {
        iss: "anSwer",
        sub: "xXx",
        exp: Date.now() + 99,
    }
    const payload3 = {
      data: 123
    }
    const secret3 = "MYW*Bka*#J@"

    it("should expire correctly", done => {
      const token = jt(header3, payload3, secret3)
      setTimeout(() => {
        jt.check(token, secret3, header3.iss, header3.sub, err => {
          assert.equal(err, null)
          setTimeout(() => {
            jt.check(token, secret3, header3.iss, header3.sub, err => {
              assert.equal(err, "expired")
              done()
            })
          }, 100)
        })
      }, 5)
    })


  })
})
