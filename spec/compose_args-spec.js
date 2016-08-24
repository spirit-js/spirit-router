const compose_args = require("../lib/router").compose_args

describe("compose_args", () => {
  // this test also ensures handler is wrapped as a Promise
  it("calls handler with the same initial arguments", (done) => {
    const handler = (input, arg) => {
      expect(input.a).toBe("first12")
      expect(input._tmp).toBe(undefined)
      expect(arg).toBe("second")
      return "ok"
    }

    const middleware = [
      (handler) => {
        return (input, test) => {
          expect(input.a).toBe("first")
          expect(input._tmp).toEqual(["second"])
          expect(test).toBe("second")
          input.a += "1"
          return handler(input).then((resp) => {
            return resp + 2
          })
        }
      },

      (handler) => {
        return (input, test) => {
          expect(input.a).toBe("first1")
          expect(input._tmp).toEqual(["second"])
          expect(test).toBe(undefined)
          input.a += "2"
          return handler(input, "woops").then((resp) => {
            return resp + 1
          })
        }
      }
    ]

    const fn = compose_args(handler, middleware)
    fn({a: "first"}, "second").then((result) => {
      expect(result).toBe("ok12")
      done()
    })
  })

  it("each middleware will correctly call the next func with arguments", (done) => {
    const handler = function(a, b) {
      return b
    }

    const route = compose_args(handler, [
      (handler) => {
        return (a, b, c) => {
          expect(a._tmp).toEqual([2])
          expect(b).toBe(2)
          expect(c).toBe(undefined)
          return handler(a, b, 3)
        }
      },
      (handler) => {
        return (a, b, c, d) => {
          expect(a._tmp).toEqual([2])
          expect(b).toBe(2)
          expect(c).toBe(3)
          expect(d).toBe(undefined)
          return handler(a, b, c, 4)
        }
      }
    ])
    route({}, 2).then((result) => {
      expect(result).toBe(2)
      done()
    })
  })

  it("can exit early, not calling remaining middleware / handler", (done) => {
    let free = ""

    const handler = () => {
      free += "_final"
    }

    const route = compose_args(handler, [
      (handler) => {
        return () => {
          free += "_mw1"
          return handler().then((result) => {
            return result + "_ok"
          })
        }
      },
      (handler) => {
        return () => {
          free += "_mw2"
          return "ok"
        }
      },
      (handler) => {
        return () => {
          free += "_mw3"
          return handler()
        }
      }
    ])
    route({}).then((resp) => {
      expect(resp).toBe("ok_ok")
      setTimeout(() => {
        expect(free).toBe("_mw1_mw2")
        done()
      }, 10)
    })
  })

  it("promises ok", (done) => {
    const handler = (o) => {
      return new Promise((resolve, reject) => {
        resolve("ok")
      })
    }

    const middleware = (_handler) => {
      return (o) => {
        return new Promise((resolve, reject) => {
          const result = _handler(o)
          resolve(result)
        })
      }
    }

    const fn = compose_args(handler, [middleware, middleware])
    fn({}).then((result) => {
      expect(result).toBe("ok")
      done()
    })
  })
})
