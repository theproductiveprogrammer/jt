'use strict'
const assert = require('assert')

const jt = require('../')

describe("jt", () => {
  describe("jt", () => {

    it("should ignore nulls", () => assert.equal(jt(), null))
    it("should fail if doesn't have enough parameters", () => assert.equal(jt({},{}), null))
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
    })

  })
})
