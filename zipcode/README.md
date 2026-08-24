# GeoResolve

GeoResolve is a HyperDart ZIP code and city lookup application. A person can type a ZIP code or a natural-language question and receive a clear location result, while the component also accepts HyperDart `searchData` for automatic query resolution.

## Run locally

```powershell
npm install
npm start
```

Build the component with `npm run build`.

## HyperDart integration

The entry point is `src/frontend/index.tsx` and exports `withHD(GeoResolve)`. HyperDart can provide `query`, `queryTerm`, `keyword`, and `entities`. Entity collections supported by the parser include `ZIP_CODES`, `CITIES`, `STATES_ADMIN1`, and `COUNTRIES`; malformed or missing nested fields are ignored safely.

Examples include:

- `What city is ZIP code 90210?`
- `Zip codes for Belmont Massachusetts`
- `City lookup Belmont MA`

## Lookup modes

`VITE_LOCATION_API_MODE` controls the adapter:

- `demo` (default): local sample data for 90210, 10001, and Belmont, MA.
- `live`: calls the documented Zippopotam.us endpoints without a frontend secret.
- `fallback`: uses the local offline samples.

The demo dataset includes Beverly Hills, New York, Belmont, Cambridge, Chicago, San Francisco, Dallas, Seattle, and Miami Beach. Results identify their source as `Demo data`, `Live API`, or `Offline fallback`.

The lookup adapter is isolated in `src/frontend/locationService.ts`, so a production backend can replace `lookupLocation` without changing the UI. A server-side proxy is recommended for production rate limiting and observability.

## Data and API

The backend includes GeoNames import tooling, cached `/api/postal` and `/api/city` routes, and a D1-compatible schema. Download and import the postal dataset with:

```powershell
Expand-Archive -Force data/allCountries.zip data
npm run import:geonames
```

Postal-code data © GeoNames. Current demo data is explicitly labeled `Demo data` or `Offline fallback`.

## Known limitations

The offline dataset is a curated demo set; live coverage depends on the selected upstream provider. Configure a real Cloudflare D1 database ID in `src/backend/wrangler.jsonc` before deployment; do not commit secrets or local dataset files.

## Two-minute judge demo

1. Enter `What city is ZIP code 90210?` and show the Beverly Hills result.
2. Enter `Zip codes for Belmont Massachusetts` and show the Belmont postal-code result.
3. Ask the GeoResolve chatbot about `90210` and show its direct answer.
4. Submit an invalid ZIP to show the friendly error state.
5. Switch between live API and offline fallback to show resilience.
