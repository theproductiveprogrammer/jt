'use strict'
const assert = require('assert')

const jt = require('../')

describe("jt", () => {
  describe("jt", () => {

    it("should ignore nulls", () => {
      assert.equal(jt(), null)
    })

    it("should fail if doesn't have enough parameters", () => {
      assert.equal(jt({},{}), null)
    })

  })
})
