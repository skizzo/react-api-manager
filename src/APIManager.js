
//  v0.0.3 - see https://github.com/skizzo/react-api-manager/blob/master/CHANGELOG.md

var log = require ("log-with-style")
import "whatwg-fetch"

class CustomError extends Error {
  constructor (data = null, ...args) {
    super (...args);
    this.data = data;
  }
}

const getTimeoutPromise = (ms, promise, contentObj = {type: "Timeout"}) => {
  return new Promise ((resolve, reject) => {
    setTimeout (() => {
      reject (new CustomError (null, "Timeout"))
    }, ms)
    promise.then (resolve, reject)
  })
}

const getFetchPostParams = (params = {}) => {
  return {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // 'Upgrade-Insecure-Requests': '1',
    },
    body: JSON.stringify (params)
  }
}

const promiseTimeout = (ms, promise) => {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise ((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout (id);
      reject ({type: "Timeout", message: 'Timed out in '+ ms + 'ms.'})
    }, ms)
  })
  // Returns a race between our timeout and the passed in promise
  return Promise.race ([promise, timeout])
}

var APIManager = {

  init (options) {
    const {apiroot, debug} = options

    if (!apiroot) {
      return new Promise ((resolve, reject) => {
        reject (new CustomError (null, "NoApiRoot"))
      })
    }

    this.apiroot = apiroot
    this.debug = !!debug ? debug : false

    this.debugger ("init ()", options)

    return new Promise ((resolve, reject) => {
      const pathFull = `${this.apiroot}/status`
      const fetchParams = getFetchPostParams()
      setTimeout (() => { // weird IE bug
        fetch (pathFull, fetchParams)
        .then (res => {
          if (res.status == 200)  { return res.json () }
          else                    { reject (res) }
        })
        .then (resJSON => { resolve (resJSON) })
        .catch (err =>    { reject (err) })
      }, 1)
    })
  },

  debugger (msg, data = null, type = "default") { // 
    if (!this.debug)
      return

    const colorBG = type == "error" ? "red" : "black"
    const colorFG = "white"

    log (`[c="color: ${colorFG}; background: ${colorBG};"][APIManager.js][c]: ` + msg, data)
  },

  fetchAPI (params) { // ONLY WORKS FOR GET REQUESTS!

    if (!this.apiroot) {
      debugger
      return new Promise ((resolve, reject) => {
        this.debugger ("fetchAPI (): missing apiroot param in init ()", params, "error")
        reject (new CustomError (null, "NoApiRoot"))
      })
    }

    const fetchURLAdd = !params.params ? "" :"?" + Object.keys (params.params).map (k => encodeURIComponent (k) + "=" + encodeURIComponent (params.params[k])).join ("&")

    if (!params.path)                 params.path = ""
    if (!params.params)               params.params = {}
    if (!params.timeout)              params.timeout = 10000
    if (params.retries == undefined)  params.retries = 5

    params.pathFull = `${this.apiroot}${params.path}${fetchURLAdd}`

    return getTimeoutPromise (params.timeout, fetch (params.pathFull))
    .then (res => { 
      const {status} = res
      switch (status) {
        case 200: { return res.json(); break }
        case 500: { throw new CustomError ({res, status}, "Server"); break }
        case 404: { throw new CustomError ({res, status}, "MethodNotFound"); break }
        default:  { throw new CustomError ({res, status}, "Unknown") } 
      }
    })
    .then (resJSON => {
      return resJSON 
    })
    .catch ((error) => {
      const {message, data} = error // is ALWAYS a CustomError!
      if (message == "Timeout") {
        if (params.retries > 0) {
          return this.fetchAPI (Object.assign ({}, params, {retries: params.retries - 1, timeout: params.timeout + 1000}) )
        }
        else {
          throw error
        }
      }
      else if (message == "Server") { // thrown in getTimeoutPromise()'s first .then(..)
        return data.res.json()
        .then ((errorJSON) => {
          const {response} = errorJSON
          const {errorFull} = response || {errorFull: {}}
          const {file, line, message} = errorFull
          throw new CustomError ({...data, file, line, message}, "Server")
        })
      }
      else {
        throw error
      }
    })
  },
}
export default APIManager