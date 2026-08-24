// ===================================================================
// src/frontend/NewComponent.jsx — full updated version
// ===================================================================
import React, { useEffect, useState } from 'react'
import { MapPin, Search, AlertCircle, Loader2, Globe2, Copy, ExternalLink, History } from 'lucide-react'
import './NewComponent.css'

const EXAMPLES = ['90210', 'Belmont MA', '10001', 'Austin TX']
const STATE_ABBR = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT',
  delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI',
  minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
  'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
}

export default function NewComponent({ searchData = null }) {
  const [status, setStatus] = useState('idle')
  const [payload, setPayload] = useState(null)
  const [manualQuery, setManualQuery] = useState('')
  const [recent, setRecent] = useState([])
  const [copied, setCopied] = useState(false)

  // Auto-run when the platform injects searchData via withHD
  useEffect(() => {
    if (!searchData) return
    const entity = searchData.entities?.[0]
    const query = searchData.queryTerm || searchData.query || entity?.word || ''
    if (query) handleManualSearch(query)
  }, [searchData])

  function getLookupUrl(query) {
    const normalized = query.trim().replace(/\s+/g, ' ')
    const zipMatch = normalized.match(/^\d{5}(?:-\d{4})?$/)
    if (zipMatch) return { type: 'postal', url: `https://api.zippopotam.us/us/${encodeURIComponent(normalized)}` }

    const commaMatch = normalized.match(/^(.+?),\s*([A-Za-z ]+)$/)
    const words = normalized.split(' ')
    const shortState = words.length > 1 && /^[A-Za-z]{2}$/.test(words[words.length - 1])
      ? words.pop()
      : ''
    const fullState = Object.keys(STATE_ABBR).sort((a, b) => b.length - a.length).find((name) => normalized.toLowerCase().endsWith(` ${name}`))
    const city = commaMatch ? commaMatch[1].trim() : fullState ? normalized.slice(0, -(fullState.length + 1)).trim() : words.join(' ')
    const stateKey = commaMatch ? commaMatch[2].trim().toLowerCase() : (fullState || shortState).toLowerCase()
    const state = STATE_ABBR[stateKey] || stateKey.toUpperCase()
    if (city && state.length === 2) {
      return {
        type: 'city',
        url: `https://api.zippopotam.us/us/${encodeURIComponent(state)}/${encodeURIComponent(city)}`,
      }
    }

    return null
  }

  function runLookup(query) {
    const lookup = getLookupUrl(query)
    if (!lookup) {
      setStatus('error')
      setPayload({ message: 'Enter a five-digit ZIP code or a city followed by a state abbreviation.' })
      return
    }

    let cancelled = false
    setStatus('loading')
    setCopied(false)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    fetch(lookup.url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          const error = new Error('Lookup failed')
          error.status = res.status
          throw error
        }
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setPayload({ status: 'success', type: lookup.type, data: json })
        setStatus('success')
        pushRecent(query)
      })
      .catch((error) => {
        if (cancelled) return
        setStatus(error.status === 404 ? 'not_found' : 'error')
        setPayload({ message: error.status === 404 ? 'No location was found for that search.' : error.name === 'AbortError' ? 'The location service took too long to respond. Please try again.' : 'Could not reach the location service.' })
      })
      .finally(() => clearTimeout(timeoutId))

    return () => {
      cancelled = true
    }
  }

  function pushRecent(term) {
    if (!term) return
    setRecent((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())]
      return next.slice(0, 5)
    })
  }

  function handleManualSearch(term) {
    const q = (term ?? manualQuery).trim()
    if (!q) return
    setManualQuery(q)
    runLookup(q)
  }

  function handleCopy(text) {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="lookup-app">
      <div className="lookup-noise" aria-hidden="true" />
      <header className="lookup-nav">
        <div className="lookup-brand">
          <span className="lookup-brand-mark"><MapPin size={18} /></span>
          <span>HyperDart Zip / City Lookup</span>
        </div>
        <span className="lookup-status"><span className="lookup-status-dot" /> Worldwide lookup</span>
      </header>

      <section className="lookup-hero">
        <div className="lookup-copy">
          <p className="lookup-kicker">HYPERDART / LOCATION TOOL</p>
          <h1>Find the place behind every ZIP code.</h1>
          <p className="lookup-intro">Search a ZIP code or city above and get coordinates, state, and map directions in seconds.</p>
        </div>

        <div className="lookup-panel">
          <div className="lookup-panel-label"><Search size={15} /> Search location</div>
          <div className="lookup-search-row">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              placeholder="Try a ZIP or 'City ST'"
              aria-label="Search a ZIP code or city"
            />
            <button onClick={() => handleManualSearch()} aria-label="Search">
              <Search size={18} />
              <span>Search</span>
            </button>
          </div>
          <div className="lookup-examples">
            <span>Try</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => handleManualSearch(ex)}>{ex}</button>
            ))}
          </div>
          {recent.length > 0 && (
            <div className="lookup-history"><History size={14} /><span>Recent</span>
              {recent.map((term) => <button key={term} onClick={() => handleManualSearch(term)}>{term}</button>)}
            </div>
          )}
        </div>
      </section>
      <section className="lookup-results" aria-live="polite">
        {status === 'idle' && (
          <div className="lookup-empty">
            <Search size={16} /> Search a ZIP code or city above
          </div>
        )}

        {status === 'loading' && (
          <div className="lookup-empty">
            <Loader2 size={18} className="lookup-spinner" /> Looking up location…
          </div>
        )}

        {status === 'unsupported' && (
          <div className="lookup-message lookup-warning">
            <Globe2 size={17} />
            <span>{payload?.message}</span>
          </div>
        )}

        {status === 'error' && payload?.code === 'rate_limited' && (
          <div className="lookup-message lookup-warning">
            <AlertCircle size={17} />
            <span>{payload?.message}</span>
          </div>
        )}

        {(status === 'error' && payload?.code !== 'rate_limited') || status === 'not_found' ? (
          <div className="lookup-message lookup-error">
            <AlertCircle size={17} />
            <span>{payload?.message}</span>
          </div>
        ) : null}

        {status === 'success' && payload?.data && (
          <div className="lookup-success">
            <div className="lookup-result-heading">
              <div>
                <span className="lookup-eyebrow">RESULTS</span>
                <strong>{payload.type === 'postal' ? 'Postal code result' : 'City result'}</strong>
              </div>
              {payload.cached && <span className="lookup-cached">cached</span>}
            </div>
            <div className="lookup-result-grid">
              {(payload.data.places || []).map((place, i) => {
                const mapsUrl = `https://www.google.com/maps?q=${place['latitude']},${place['longitude']}`
                const state = place['state'] || payload.data.state
                const stateAbbreviation = place['state abbreviation'] || payload.data['state abbreviation']
                const postalCode = place['post code'] || payload.data['post code']
                return (
                  <div key={i} className="lookup-place">
                    <div className="lookup-place-top">
                      <div><span className="lookup-place-index">0{i + 1}</span><strong>{place['place name']}</strong></div>
                      <a href={mapsUrl} target="_blank" rel="noreferrer" title="Open in Google Maps"><ExternalLink size={15} /></a>
                    </div>
                    <div className="lookup-place-location">{state} ({stateAbbreviation}), {payload.data.country} ({payload.data['country abbreviation']})</div>
                    <div className="lookup-place-meta">
                      <span>Lat {place['latitude']}</span><span>Lng {place['longitude']}</span>
                      {postalCode && <button onClick={() => handleCopy(postalCode)}><Copy size={12} /> ZIP {postalCode}</button>}
                    </div>
                  </div>
                )
              })}
            </div>
            {copied && <div className="lookup-copied">Copied</div>}
          </div>
        )}
      </section>
    </main>
  )
}