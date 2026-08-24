import express from 'express'

const router = express.Router()
const cache = new Map()
const CACHE_TTL_MS = 10 * 60 * 1000

function readCache(key) {
  const item = cache.get(key)
  if (!item || Date.now() - item.createdAt > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return item.value
}

function writeCache(key, value) {
  cache.set(key, { createdAt: Date.now(), value })
  if (cache.size > 500) cache.delete(cache.keys().next().value)
}

function normalizeCountry(value) {
  return String(value || 'US').trim().toUpperCase().slice(0, 2)
}

function toPlace(row) {
  return {
    'post code': row.postal_code,
    'place name': row.place_name,
    state: row.admin1_name,
    'state abbreviation': row.admin1_code,
    country: row.country_code,
    latitude: row.latitude,
    longitude: row.longitude,
  }
}

function sendError(res, status, message, code = 'bad_request') {
  return res.status(status).json({ status: 'error', code, message })
}

router.get('/postal', async (req, res) => {
  const code = String(req.query.code || req.query.postalCode || '').trim()
  const country = normalizeCountry(req.query.country)
  if (!code) return sendError(res, 400, 'Provide a postal code with ?code=.')

  const key = `postal:${country}:${code.toLowerCase()}`
  const cached = readCache(key)
  if (cached) return res.json({ ...cached, cached: true })

  const db = req.getDB()
  if (!db) return sendError(res, 503, 'Postal database is not configured yet.', 'database_unavailable')
  const result = await db.prepare(`
    SELECT postal_code, place_name, admin1_name, admin1_code, country_code, latitude, longitude
    FROM postal_codes
    WHERE country_code = ? AND lower(postal_code) = lower(?)
    ORDER BY place_name
    LIMIT 100
  `).bind(country, code).all()

  if (!result.results.length) return res.status(404).json({ status: 'not_found', message: `No location found for postal code "${code}".` })
  const response = { status: 'success', type: 'postal', data: { country, places: result.results.map(toPlace) }, attribution: 'Postal-code data © GeoNames' }
  writeCache(key, response)
  return res.json(response)
})

router.get('/city', async (req, res) => {
  const city = String(req.query.city || '').trim()
  const state = String(req.query.state || '').trim()
  const country = normalizeCountry(req.query.country)
  if (!city) return sendError(res, 400, 'Provide a city with ?city=.')

  const key = `city:${country}:${state.toLowerCase()}:${city.toLowerCase()}`
  const cached = readCache(key)
  if (cached) return res.json({ ...cached, cached: true })

  const db = req.getDB()
  if (!db) return sendError(res, 503, 'Postal database is not configured yet.', 'database_unavailable')
  const result = await db.prepare(`
    SELECT postal_code, place_name, admin1_name, admin1_code, country_code, latitude, longitude
    FROM postal_codes
    WHERE country_code = ? AND lower(place_name) = lower(?)
      AND (? = '' OR lower(admin1_code) = lower(?) OR lower(admin1_name) = lower(?))
    ORDER BY postal_code
    LIMIT 100
  `).bind(country, city, state, state, state).all()

  if (!result.results.length) return res.status(404).json({ status: 'not_found', message: `No location found for "${city}${state ? `, ${state}` : ''}".` })
  const response = { status: 'success', type: 'city', data: { country, places: result.results.map(toPlace) }, attribution: 'Postal-code data © GeoNames' }
  writeCache(key, response)
  return res.json(response)
})

export function createPostalRouter(getDB) {
  router.use((req, res, next) => {
    req.getDB = getDB
    next()
  })
  return router
}