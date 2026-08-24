export type LookupMode = 'postal' | 'city'
export type LookupStatus = 'idle' | 'loading' | 'success' | 'error'
export type DataSource = 'live' | 'demo' | 'fallback'

export type LocationResult = {
  postalCode?: string
  city?: string
  state?: string
  stateCode?: string
  country?: string
  countryCode?: string
  latitude?: string
  longitude?: string
  place?: string
}

export type LookupRequest = {
  mode: LookupMode
  country: string
  postalCode?: string
  state?: string
  city?: string
}

export type QueryAnalysis = {
  originalQuery: string
  mode: LookupMode | null
  country?: string
  countryCode?: string
  postalCode?: string
  state?: string
  stateCode?: string
  city?: string
  confidence: number
  endpoint?: string
  entityCollection?: string
}

export type LookupResponse = {
  results: LocationResult[]
  source: DataSource
  statusCode?: number
  responseTimeMs?: number
  endpoint?: string
}

type SearchEntity = {
  collectionName?: string
  wgName?: string
  word?: string
  description?: string
  info?: { Type?: string }
  entityInfo?: {
    Country?: string
    countryCode?: string
    postalCode?: string
    geo?: { state?: string; stateAbb?: string; city?: string; countryCode?: string }
  }
}

type SearchData = { query?: string; queryTerm?: string; keyword?: string; entities?: SearchEntity[] }

const FALLBACK_RESULTS: LocationResult[] = [
  { postalCode: '90210', city: 'Beverly Hills', state: 'California', stateCode: 'CA', country: 'United States', countryCode: 'US', latitude: '34.0901', longitude: '-118.4065' },
  { postalCode: '10001', city: 'New York', state: 'New York', stateCode: 'NY', country: 'United States', countryCode: 'US', latitude: '40.7506', longitude: '-73.9972' },
  { postalCode: '02139', city: 'Cambridge', state: 'Massachusetts', stateCode: 'MA', country: 'United States', countryCode: 'US', latitude: '42.3646', longitude: '-71.1042' },
  { postalCode: '02478', city: 'Belmont', state: 'Massachusetts', stateCode: 'MA', country: 'United States', countryCode: 'US', latitude: '42.3959', longitude: '-71.1787' },
  { postalCode: '60614', city: 'Chicago', state: 'Illinois', stateCode: 'IL', country: 'United States', countryCode: 'US', latitude: '41.9227', longitude: '-87.6496' },
  { postalCode: '94105', city: 'San Francisco', state: 'California', stateCode: 'CA', country: 'United States', countryCode: 'US', latitude: '37.7898', longitude: '-122.3942' },
  { postalCode: '75201', city: 'Dallas', state: 'Texas', stateCode: 'TX', countryCode: 'US', latitude: '32.7876', longitude: '-96.7994' },
  { postalCode: '98101', city: 'Seattle', state: 'Washington', stateCode: 'WA', country: 'United States', countryCode: 'US', latitude: '47.6101', longitude: '-122.3344' },
  { postalCode: '33109', city: 'Miami Beach', state: 'Florida', stateCode: 'FL', country: 'United States', countryCode: 'US', latitude: '25.7617', longitude: '-80.1392' },
]

const STATES: Record<string, string> = { alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', florida: 'FL', georgia: 'GA', illinois: 'IL', indiana: 'IN', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', tennessee: 'TN', texas: 'TX', utah: 'UT', virginia: 'VA', washington: 'WA', wisconsin: 'WI', wyoming: 'WY', 'north carolina': 'NC', 'south carolina': 'SC', 'rhode island': 'RI' }

function valueOf(entity: SearchEntity | undefined): string | undefined { return entity?.word || entity?.description }
function isPostal(entity: SearchEntity | undefined): boolean { return entity?.collectionName === 'ZIP_CODES' || entity?.info?.Type?.toLowerCase() === 'zipcodes' }
function isCity(entity: SearchEntity | undefined): boolean { return entity?.collectionName === 'CITIES' || entity?.info?.Type?.toLowerCase() === 'cities' }

export function analyzeQuery(searchData: unknown, manualQuery = ''): QueryAnalysis {
  const data = (searchData && typeof searchData === 'object' ? searchData : {}) as SearchData
  const entities = Array.isArray(data.entities) ? data.entities : []
  const postalEntity = entities.find(isPostal)
  const cityEntity = entities.find(isCity)
  const stateEntity = entities.find((entity) => entity.collectionName === 'STATES_ADMIN1')
  const countryEntity = entities.find((entity) => entity.collectionName === 'COUNTRIES')
  const originalQuery = String(data.query || data.queryTerm || data.keyword || manualQuery || '').trim()
  const postalCode = valueOf(postalEntity) || postalEntity?.entityInfo?.postalCode || originalQuery.match(/\b\d{5}(?:-\d{4})?\b/)?.[0]
  const countryCode = postalEntity?.entityInfo?.countryCode || cityEntity?.entityInfo?.geo?.countryCode || countryEntity?.entityInfo?.countryCode || 'US'
  const country = postalEntity?.entityInfo?.Country || countryEntity?.word || 'United States'
  const geo = cityEntity?.entityInfo?.geo
  let city = valueOf(cityEntity) || geo?.city
  let state = geo?.state || valueOf(stateEntity)
  let stateCode = geo?.stateAbb
  const cityQuery = originalQuery.match(/(?:city lookup|zip codes? for)\s+(.+?)(?:,|\s)\s*([A-Za-z]{2})$/i) || originalQuery.match(/^(.+?),?\s+([A-Za-z]{2})$/i)
  if (cityQuery) {
    city = cityQuery[1].trim()
    stateCode = cityQuery[2].toUpperCase()
  }
  const cityWithFullState = originalQuery.match(/(?:zip codes?|postal codes?)\s+for\s+(.+)$/i)
  if (cityWithFullState) {
    const location = cityWithFullState[1].trim()
    const fullState = Object.keys(STATES).sort((a, b) => b.length - a.length).find((name) => location.toLowerCase().endsWith(name))
    if (fullState) {
      city = location.slice(0, -(fullState.length + 1)).trim()
      state = fullState.replace(/\b\w/g, (letter) => letter.toUpperCase())
      stateCode = STATES[fullState]
    }
  }
  if (!stateCode && state) stateCode = STATES[state.toLowerCase()] || state.toUpperCase()
  if (!state && originalQuery) {
    const fullState = Object.keys(STATES).sort((a, b) => b.length - a.length).find((name) => originalQuery.toLowerCase().endsWith(name))
    if (fullState) { state = fullState.replace(/\b\w/g, (letter) => letter.toUpperCase()); stateCode = STATES[fullState] }
  }
  const cityRequest = Boolean(city && stateCode) && /\b(for|in|lookup)\b/i.test(originalQuery)
  const wantsPostal = Boolean(postalCode) || /\b(zip|postal)\s*(code|codes)?\b/i.test(originalQuery)
  const wantsCity = Boolean(city && stateCode) || /\b(city|cities)\b/i.test(originalQuery)
  const mode: LookupMode | null = cityRequest && !postalEntity ? 'city' : postalEntity || !cityRequest && postalCode ? 'postal' : wantsCity && stateCode ? 'city' : wantsPostal ? 'postal' : null
  const endpoint = mode === 'postal' && postalCode ? `https://api.zippopotam.us/${countryCode.toLowerCase()}/${encodeURIComponent(postalCode)}` : mode === 'city' && city && stateCode ? `https://api.zippopotam.us/${countryCode.toLowerCase()}/${encodeURIComponent(stateCode)}/${encodeURIComponent(city)}` : undefined
  return { originalQuery, mode, country, countryCode, postalCode, city, state, stateCode, confidence: mode ? postalEntity || cityEntity ? 0.98 : 0.84 : 0.25, endpoint, entityCollection: postalEntity?.collectionName || cityEntity?.collectionName || stateEntity?.collectionName }
}

export function normalizePostalResponse(data: any): LocationResult[] { return (data?.places || []).map((place: any) => ({ postalCode: data['post code'], city: place['place name'], place: place['place name'], state: place.state, stateCode: place['state abbreviation'], country: data.country, countryCode: data['country abbreviation'], latitude: place.latitude, longitude: place.longitude })) }
export function normalizeCityResponse(data: any): LocationResult[] { return (data?.places || []).map((place: any) => ({ postalCode: place['post code'], city: place['place name'], place: place['place name'], state: data.state || place.state, stateCode: data['state abbreviation'] || place['state abbreviation'], country: data.country, countryCode: data['country abbreviation'], latitude: place.latitude, longitude: place.longitude })) }

export function getFallbackResult(request: LookupRequest): LookupResponse {
  const results = request.mode === 'postal' ? FALLBACK_RESULTS.filter((item) => item.postalCode === request.postalCode) : FALLBACK_RESULTS.filter((item) => item.city?.toLowerCase() === request.city?.toLowerCase() && item.stateCode === request.state?.toUpperCase())
  return { results, source: 'fallback', statusCode: results.length ? 200 : 404, responseTimeMs: 0 }
}

export async function lookupLocation(request: LookupRequest, mode: 'demo' | 'live' | 'fallback' = ((import.meta.env.VITE_LOCATION_API_MODE || 'demo') as 'demo' | 'live' | 'fallback')): Promise<LookupResponse> {
  if (mode === 'fallback') return getFallbackResult(request)
  const fallback = getFallbackResult(request)
  if (mode === 'demo') { await new Promise((resolve) => setTimeout(resolve, 500)); if (!fallback.results.length) throw new Error('No location was found for that lookup.'); return { ...fallback, source: 'demo', responseTimeMs: 500 } }
  const country = request.country || 'US'
  const endpoint = request.mode === 'postal' ? `https://api.zippopotam.us/${country.toLowerCase()}/${encodeURIComponent(request.postalCode || '')}` : `https://api.zippopotam.us/${country.toLowerCase()}/${encodeURIComponent(request.state || '')}/${encodeURIComponent(request.city || '')}`
  const started = performance.now(); const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 7000)
  try { const response = await fetch(endpoint, { signal: controller.signal }); if (!response.ok) throw new Error(response.status === 404 ? 'No location was found for that lookup.' : 'The location service returned an error.'); const data = await response.json(); return { results: request.mode === 'postal' ? normalizePostalResponse(data) : normalizeCityResponse(data), source: 'live', statusCode: response.status, responseTimeMs: Math.round(performance.now() - started), endpoint } } finally { clearTimeout(timeout) }
}
