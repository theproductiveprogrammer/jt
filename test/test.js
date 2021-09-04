'use strict'
const assert = require('assert')

const jt = require('../')

describe("jt", () => {
  describe("jt", () => {

    it("should ignore nulls", () => assert.equal(jt(), null))
    it("should fail if doesn't have enough parameters", () => assert.equal(jt({},{}), null))

    it("should decode an empty payload", done => jt.decode(null, (err, header, payload) => {
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

    const header1 = {
        iss: "authSvc",
        sub: "userRoles",
        exp: 1630730447160,
    }
    const payload1_empty = null
    const secret1 = "my secret key"
    const token1 = "eyJpc3MiOiJhdXRoU3ZjIiwic3ViIjoidXNlclJvbGVzIiwiZXhwIjoxNjMwNzMwNDQ3MTYwfQ.bnVsbA.KbkdXYDFesS0acvAu22t8wi2XASyyhLZUWDTMB9PmUw"

    it("should return a valid token with empty payload", () => assert.equal(jt(header1,payload1_empty,secret1), token1))

    it("should return the empty payload", done => {
      jt.decode(token1, (err, header, payload) => {
        assert.equal(err, null)
        assert.deepEqual(header, header1)
        assert.deepEqual(payload, payload1_empty)
        done()
      })
    })

  })
})
