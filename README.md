# API test automation with Jest and PactumJS

> Simple integration between JestJS and PactumJS.

## GitHub Actions

[![Node.js CI](https://github.com/ugioni/integration-tests-jest/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/ugioni/integration-tests-jest/actions/workflows/node.js.yml)

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ugioni_integration-tests-jest&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ugioni_integration-tests-jest)

# Getting Started

### Pactum docs:
 - [PactumJS](https://pactumjs.github.io/)

### Prerequisites:
 - NodeJS `v22`

### How to run?

Inside of the project folder run:

 1. `npm install --save-dev`
 1. `npm run ci`

After that you should see a `./output` folder with some `HTML` reports.

### Go REST token (optional for local / required for authenticated scenarios)

The suite `test/go_rest.spec.ts` has public scenarios and authenticated scenarios.

- Without `GOREST_TOKEN`: only public scenarios are executed.
- With `GOREST_TOKEN`: authenticated create/update/delete scenarios are executed.

Local execution options:

1. Set token in current PowerShell session:
	- `$env:GOREST_TOKEN="your_token_here"`
2. Or load from `.env` before running tests.

Then run:

- `npm run ci`

### GitHub Actions secret

To run authenticated Go REST scenarios in CI, create repository secret:

- Name: `GOREST_TOKEN`
- Value: your Go REST personal access token

Path: `Settings` → `Secrets and variables` → `Actions`.

### Docs to Api under tests: 
 - [DummyJSON](https://dummyjson.com/docs)
 - [Go REST](https://gorest.co.in/)
 - [Toolshop API](https://api.practicesoftwaretesting.com/api/documentation)
 - [Deck of Cards](https://deckofcardsapi.com/)
 - [JSON Placeholder](https://jsonplaceholder.typicode.com/)
 - [HttpBin](http://httpbin.org/)
 - [Rick and Morty API](https://rickandmortyapi.com/documentation/#rest)
 - [Petstore](https://petstore.swagger.io/#/)
 - [ServeRest](https://serverest.dev/#/)
 - [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html)
 - [ServeRest - Datadog](https://p.datadoghq.eu/sb/421fcfee-35ec-11ee-b87f-da7ad0900005-2aaf85264a89d11b7001bcab452a266e?refresh_mode=sliding&theme=light&tpl_var_env%5B0%5D=serverest.dev&from_ts=1699931511294&to_ts=1699932411294&live=true)
