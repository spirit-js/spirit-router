const fs = require("fs")
const Promise = require("bluebird")
const response_map = require("./response-map")
const path = require("path")

const resources = (mount_path="", opts={}) => {
  if (typeof mount_path === "object") {
    opts = mount_path
    mount_path = ""
  }
  if (opts.root === undefined) opts.root = "public/"
  if (opts.root !== "" && opts.root[opts.root.length] !== "/") opts.root = opts.root + "/"
  if (!opts.mime) opts.mime = {}

  return (request, prefix) => {
    if (request.method.toLowerCase() !== "get") {
      return undefined
    }

    const mount_pt = prefix + mount_path
    if (request.url.indexOf(mount_pt) !== 0) {
      return undefined
    }

    // remove the prefix + url_path from the request url
    // to get the correct file path
    // additionally, remove any beginning "/"
    let idx = mount_pt.length
    if (request.url[idx] === "/") idx += 1
    const fp = opts.root + request.url.slice(idx)

    let ext = path.extname(fp)
    const optext = opts.mime[ext]

    return new Promise((resolve, reject) => {
      const f = fs.createReadStream(fp)
      f.once("error", () => {
        resolve()
      })
      f.once("open", () => {
        const rmap = response_map.create(f).type(ext)
        if (optext) rmap.headers["Content-Type"] = optext
        resolve(rmap)
      })
    })
  }
}

const not_found = (body) => {
  return () => {
    return response_map.create(body).statusCode(404)
  }
}

module.exports = {
  resources,
  not_found
}
