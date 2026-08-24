// ===================================================================
// src/backend/index.js — full updated version
// ===================================================================
import express from 'express'
import cors from 'cors'
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';
import { createPostalRouter } from './postal-api.js'

const app = express();
app.use(express.json())

const devDomain = env.DEV_DOMAIN
const stagingDomain = env.STAGING_DOMAIN
const prodDomain = env.PROD_DOMAIN

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  devDomain,
  stagingDomain,
  prodDomain
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

const getDB = () => env.DB
app.use('/api', createPostalRouter(getDB))

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from Express on Workers!' })
})

app.get('/api/hello/:name', (req, res) => {
  const environment = env.ENVIRONMENT || 'unknown'
  res.json({ message: `Hello, ${req.params.name} ${environment}` })
})

// Simple health check — useful for uptime checks once deployed
app.get('/api/health', (req, res) => {
  res.json({ ok: true, environment: env.ENVIRONMENT || 'unknown', time: Date.now() })
})


// ===================================================================
// Zip Code / City Lookup — @hyperdart/zipfinder
// ===================================================================
const ZIPPOPOTAM_BASE = 'https://api.zippopotam.us'

const STATE_ABBR = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI',
  wyoming: 'WY',
}

function fromEntity(searchData) {
  if (!searchData || !Array.isArray(searchData.entities) || !searchData.entities.length) {
    return null
  }
  const entity = searchData.entities[0]
  const collection = entity.collectionName

  if (collection === 'ZIP_CODES') {
    const country = (entity.entityInfo && entity.entityInfo.Country) || 'US'
    const postalCode = entity.word
    if (!postalCode) return null
    return { type: 'postal', country, postalCode }
  }

  if (collection === 'CITIES') {
    const geo = entity.entityInfo && entity.entityInfo.geo
    if (!geo) return null
    const country = geo.countryCode || 'US'
    let state = geo.stateAbb
    if (!state && geo.state) {
      state = STATE_ABBR[geo.state.toLowerCase()] || geo.state
    }
    const city = entity.word || geo.city
    if (!state || !city) return null
    return { type: 'city', country, state, city }
  }

  return null
}

const REGEX_ZIP = /(zip|postal)\s*code\s+(\d{3,10})/i
const REGEX_PINCODE = /pincode\s+(\d{3,10})/i
const REGEX_WHAT_CITY = /(what|which)\s+(city|state)\s+is\s+(zip|postal)\s*code\s+(\d{3,10})/i
const REGEX_ZIP_FOR_CITY = /(zip|postal)\s*codes?\s+(for|in)\s+([a-zA-Z\s]+?)(?:$)/i
const REGEX_CITY_LOOKUP = /city\s+lookup\s+([a-zA-Z\s]+?)\s+([a-zA-Z]{2})$/i
const REGEX_BARE_ZIP = /^\d{5}(-\d{4})?$/ // e.g. someone just types "90210"

function fromRawQuery(queryTerm) {
  if (!queryTerm) return null
  const q = queryTerm.trim()

  if (REGEX_BARE_ZIP.test(q)) {
    return { type: 'postal', country: 'US', postalCode: q }
  }

  let m = q.match(REGEX_WHAT_CITY) || q.match(REGEX_ZIP) || q.match(REGEX_PINCODE)
  if (m) {
    const postalCode = m[m.length - 1]
    return { type: 'postal', country: 'US', postalCode }
  }

  m = q.match(REGEX_CITY_LOOKUP)
  if (m) {
    return { type: 'city', country: 'US', city: m[1].trim(), state: m[2].toUpperCase() }
  }

  m = q.match(REGEX_ZIP_FOR_CITY)
  if (m) {
    const parts = m[3].trim().split(/\s+/)
    const stateName = parts.pop()
    const city = parts.join(' ')
    const state = STATE_ABBR[stateName.toLowerCase()] || stateName.toUpperCase()
    if (city && state) return { type: 'city', country: 'US', city, state }
  }

  // last-ditch: "belmont ma" or "belmont, ma"
  m = q.match(/^([a-zA-Z\s]+?)[,\s]+([a-zA-Z]{2})$/)
  if (m) {
    return { type: 'city', country: 'US', city: m[1].trim(), state: m[2].toUpperCase() }
  }

  return null
}

function resolveParams(searchData) {
  return (
    fromEntity(searchData) ||
    fromRawQuery(searchData && (searchData.queryTerm || searchData.query))
  )
}

function buildZipUrl(params) {
  const country = params.country.toLowerCase()
  if (params.type === 'postal') {
    return `${ZIPPOPOTAM_BASE}/${country}/${encodeURIComponent(params.postalCode)}`
  }
  return `${ZIPPOPOTAM_BASE}/${country}/${encodeURIComponent(params.state)}/${encodeURIComponent(params.city)}`
}

// --- Simple in-memory cache (per Worker instance) --------------------
// Zippopotam has no auth/rate-limit info published — cache so repeat
// lookups (very common: same ZIP searched multiple times) don't hit
// the upstream API every time.
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const cache = new Map()

function getCached(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.data
}

function setCached(key, data) {
  cache.set(key, { data, at: Date.now() })
  // keep the cache from growing unbounded on a long-lived instance
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
  }
}

// --- Simple per-IP rate limiting -------------------------------------
const RATE_LIMIT = 30 // requests
const RATE_WINDOW_MS = 60 * 1000 // per minute
const hits = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip) || { count: 0, windowStart: now }
  if (now - entry.windowStart > RATE_WINDOW_MS) {
    entry.count = 0
    entry.windowStart = now
  }
  entry.count += 1
  hits.set(ip, entry)
  return entry.count > RATE_LIMIT
}

app.use('/api/lookup', (req, res, next) => {
  const ip = req.headers['cf-connecting-ip'] || req.ip || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({
      status: 'error',
      code: 'rate_limited',
      message: 'Too many lookups — wait a moment and try again.',
    })
  }
  next()
})

async function runLookup(params) {
  if (params.country.toUpperCase() !== 'US') {
    return {
      httpStatus: 200,
      body: {
        status: 'unsupported',
        country: params.country,
        message: `Country "${params.country}" isn't supported yet — only US locations are resolved.`,
      },
    }
  }

  const url = buildZipUrl(params)
  const cached = getCached(url)
  if (cached) {
    return { httpStatus: 200, body: { status: 'success', type: params.type, params, data: cached, cached: true } }
  }

  const apiRes = await fetch(url)

  if (apiRes.status === 404) {
    return {
      httpStatus: 200,
      body: {
        status: 'not_found',
        params,
        message:
          params.type === 'postal'
            ? `No location found for postal code "${params.postalCode}".`
            : `No location found for "${params.city}, ${params.state}".`,
      },
    }
  }

  if (!apiRes.ok) {
    return { httpStatus: 502, body: { status: 'error', code: 'upstream_failed' } }
  }

  const data = await apiRes.json()
  setCached(url, data)
  return { httpStatus: 200, body: { status: 'success', type: params.type, params, data } }
}

// POST /api/lookup — original path, driven by full HD searchData payload
app.post('/api/lookup', async (req, res) => {
  const { searchData } = req.body || {}
  const params = resolveParams(searchData)

  if (!params) {
    return res.status(422).json({
      status: 'error',
      code: 'unresolved',
      message: "Couldn't tell whether this is a ZIP/postal code or a city lookup.",
    })
  }

  try {
    const result = await runLookup(params)
    return res.status(result.httpStatus).json(result.body)
  } catch (err) {
    return res.status(502).json({
      status: 'error',
      code: 'network',
      message: 'The lookup service could not be reached. Try again in a moment.',
    })
  }
})

// GET /api/lookup?q=... — raw-text path, for manual search box / testing
// without needing to construct a fake searchData object
app.get('/api/lookup', async (req, res) => {
  const q = req.query.q
  if (!q) {
    return res.status(400).json({ status: 'error', code: 'missing_query', message: 'Provide ?q=' })
  }

  const params = fromRawQuery(String(q))
  if (!params) {
    return res.status(422).json({
      status: 'error',
      code: 'unresolved',
      message: "Couldn't tell whether this is a ZIP/postal code or a city lookup.",
    })
  }

  try {
    const result = await runLookup(params)
    return res.status(result.httpStatus).json(result.body)
  } catch (err) {
    return res.status(502).json({
      status: 'error',
      code: 'network',
      message: 'The lookup service could not be reached. Try again in a moment.',
    })
  }
})

app.listen(3000)
export default httpServerHandler({ port: 3000 })