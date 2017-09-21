# React API Manager

APIManager used in most React.js projects. Basically a `fetch` variant that's able to handle retries and timeouts. [CHANGELOG.md](https://github.com/skizzo/react-api-manager/blob/master/CHANGELOG.md "react-api-manager Change Log")

## Installation

`npm install --save react-api-manager`


## Usage

### APIManager.init (options) : void

#### Parameter options

- `apiroot`: root to your API, e.g. `https://nerdybirdy.com/api`

- `debug`: debug mode (default: `false`)


### APIManager.fetchAPI (params) : Promise

#### Parameter params

- `path`: API path **without leading slash**, e.g `projects/my-test-project`

- `params`: (Optional) array of parameters

- `retries`: (Optional) Amount of retries in case fetch fails (default: `5`)

- `timeout`: (Optional) Amount of milli seconds until fetch fails with Timeout error (default: `10000` aka 10s)

#### Returns

Returns a promise that either 

- **resolves** and contains data in JSON format, or

- **rejects** and contains error data, possible values for **`error.message`**: 

  - `Timeout`: All retries have been tried, request still timed out.

  - `Server` (500): There was an error on the server, in this case the error object also contains the properties `file`, `line` and `message`.
  Check this out, next line.

  - `MethodNotFound` (404): The API method could not be found on server.

  - `Unknown`: Some weird shit happened.

## Contributing

This package is customized for a SLIM REST API and should not be contributed to.