'use strict';

var {APIManager} = require ("../index")
const VALID_API_URL = "https://nerdybirdy.net/api/"

describe ("APIManager", () => {

	it ("itself", () => {
		expect (APIManager).toBeDefined ()
		expect (APIManager.init).toBeDefined ()
		// expect (1).toBe (1)
	})

	it ("init()", () => {
		expect (APIManager.init).toBeDefined ()
	})

	it ("init() rejected when no params given", (done) => {
		APIManager.init ()
		.then (res => {
			console.log ("res: " + JSON.stringify (res, null, 2))
		})
		.catch (err => { // CustomError
			expect (err).toBeDefined ()
			expect (err.message).toEqual ("NoApiRoot")
			// console.error ("err: ", err)
			done()
		})
	})

	it ("init() resolves when params given", (done) => {
		APIManager.init ({apiroot: VALID_API_URL})
		.then (() => {
			done ()
		}) 
		.catch (err => { // CustomError
			console.error (err)
		})
	}, 10000) // can take a while.

	it ("fetchAPI() with bullshit params throws error", (done) => {
		APIManager.init ({apiroot: "https://does-not-exist/"})
		.then (() => {}) 
		.catch (err => { // CustomError
			expect (err).toBeDefined ()
			expect (err.message).toEqual ("NetworkRequestFailed")
			done ()
		})
	}, 10000) // can take a while.

	it ("fetchAPI() with tiny timeout and no retries fails", (done) => {
		APIManager.init ({apiroot: VALID_API_URL}).then (() => {
			APIManager.fetchAPI ({path: "status", timeout: 10, retries: 0})
			.then (res => {})
			.catch (err => {done ()})
		}) 
		.catch (err => { // CustomError
		})
	}, 10000) // can take a while.

	//	from now on, APIManager is initialized with valid API path
	it ('handles server error (500)', (done) => { 
		APIManager.fetchAPI ({path: "mock/servererror"})
		.then (resJSON => {
		})
	  .catch (error => {
			expect (error).toBeDefined()
			expect (error.message).toEqual ("Server")
			expect (error.data).toBeDefined ()
			expect (error.data.message).toEqual ("Use of undefined constant dummy - assumed 'dummy'")
			expect (error.data.status).toEqual (500)
	  	done ()
	  }) 
	}, 5000)

	it ('handles non-existing server functions (404)', (done) => { 
		APIManager.fetchAPI ({path: "foo/bar"})
		.then (resJSON => {
			expect (resJSON).toBeUndefined ()
		})
	  .catch (error => { 
			expect (error).toBeDefined()
			expect (error.message).toEqual ("MethodNotFound")
			expect (error.data).toBeDefined ()
			expect (error.data.status).toEqual (404)
	  	done ()
	  })
	}, 5000)


})