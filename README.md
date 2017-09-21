# react-api-manager

APIManager used in most React.js projects. Basically a `fetch` variant that's able to handle retries and timeouts.

## Usage

### APIManager.init (options) : void

#### Parameter options

- `apiroot`: root to your API, e.g. `https://nerdybirdy.com/api`

- `debug`: debug mode (default: `false`)


### APManager.fetchAPI (params) : Promise

#### Parameter params

- `path`: API path **without leading slash**, e.g `projects/my-test-project`

- `params`: Array of parameters

- `retries`: Amount of retries in case fetch fails (default: `5`)

- `timeout`: Amount of milli seconds until fetch fails with Timeout error

#### Returns

Returns a promise that either 

- resolves and contains data in JSON format

- rejects and contains error data