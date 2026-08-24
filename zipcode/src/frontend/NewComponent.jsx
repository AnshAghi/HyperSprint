// import React, { useEffect, useMemo, useState } from 'react'
// import { AlertCircle, Copy, Loader2, MapPin, Search } from 'lucide-react'
// import './NewComponent.css'

// const EXAMPLES = ['90210', 'Belmont MA', '10001', 'Austin TX']
// const STATE_ABBR = {
//   alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT',
//   delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
//   kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI',
//   minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
//   'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
//   'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
//   'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
//   virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
// }

// function buildLookupUrl(query) {
//   const normalized = query.trim().replace(/\s+/g, ' ')
//   if (!normalized) return null

//   const zipMatch = normalized.match(/^\d{5}(?:-\d{4})?$/)
//   if (zipMatch) {
//     return { type: 'postal', url: `https://api.zippopotam.us/us/${encodeURIComponent(normalized)}` }
//   }

//   const commaMatch = normalized.match(/^(.+?),\s*([A-Za-z ]+)$/)
//   const words = normalized.split(' ')
//   const shortState = words.length > 1 && /^[A-Za-z]{2}$/.test(words[words.length - 1]) ? words.pop() : ''
//   const fullState = Object.keys(STATE_ABBR).sort((a, b) => b.length - a.length).find((name) => normalized.toLowerCase().endsWith(` ${name}`))
//   const city = commaMatch ? commaMatch[1].trim() : fullState ? normalized.slice(0, -(fullState.length + 1)).trim() : words.join(' ')
//   const stateKey = commaMatch ? commaMatch[2].trim().toLowerCase() : (fullState || shortState).toLowerCase()
//   const state = STATE_ABBR[stateKey] || stateKey.toUpperCase()

//   if (city && state && state.length === 2) {
//     return { type: 'city', url: `https://api.zippopotam.us/us/${encodeURIComponent(state)}/${encodeURIComponent(city)}` }
//   }

//   return null
// }

// export default function NewComponent({ searchData = null }) {
//   const [status, setStatus] = useState('idle')
//   const [payload, setPayload] = useState(null)
//   const [manualQuery, setManualQuery] = useState('')
//   const [recent, setRecent] = useState([])

//   const derivedQuery = useMemo(() => {
//     if (!searchData) return ''
//     const queryTerm = searchData.queryTerm || searchData.query || searchData.keyword || ''
//     if (queryTerm) return queryTerm
//     const entity = searchData.entities?.[0]
//     return entity?.word || entity?.description || ''
//   }, [searchData])

//   useEffect(() => {
//     if (!derivedQuery) return
//     setManualQuery(derivedQuery)
//     runLookup(derivedQuery)
//   }, [derivedQuery])

//   function pushRecent(term) {
//     if (!term) return
//     setRecent((prev) => {
//       const next = [term, ...prev.filter((item) => item.toLowerCase() !== term.toLowerCase())]
//       return next.slice(0, 5)
//     })
//   }

//   function runLookup(query) {
//     const lookup = buildLookupUrl(query)
//     if (!lookup) {
//       setStatus('error')
//       setPayload({ message: 'Enter a five-digit ZIP code or a city and state such as Belmont MA.' })
//       return
//     }

//     setStatus('loading')
//     setPayload(null)

//     const controller = new AbortController()
//     const timeout = setTimeout(() => controller.abort(), 8000)

//     fetch(lookup.url, { signal: controller.signal })
//       .then((response) => {
//         if (!response.ok) {
//           const error = new Error('Lookup failed')
//           error.status = response.status
//           throw error
//         }
//         return response.json()
//       })
//       .then((data) => {
//         setPayload({ type: lookup.type, data })
//         setStatus('success')
//         pushRecent(query)
//       })
//       .catch((error) => {
//         const message = error?.status === 404
//           ? 'No location was found for that search.'
//           : error?.name === 'AbortError'
//             ? 'The location service took too long to respond. Please try again.'
//             : 'Could not reach the location service.'
//         setStatus('error')
//         setPayload({ message })
//       })
//       .finally(() => clearTimeout(timeout))
//   }

//   function handleSearch(term) {
//     const query = (term ?? manualQuery).trim()
//     if (!query) return
//     setManualQuery(query)
//     runLookup(query)
//   }

//   function handleCopy(value) {
//     if (!value) return
//     navigator.clipboard?.writeText(String(value))
//   }

//   const places = payload?.data?.places || []

//   return (
//     <div className="lookup-shell">
//       <div className="lookup-card">
//         <div className="lookup-header-row">
//           <div className="lookup-title-wrap">
//             <MapPin size={16} />
//             <span>GeoResolve</span>
//           </div>
//         </div>

//         <div className="lookup-search-row">
//           <input
//             type="text"
//             value={manualQuery}
//             onChange={(event) => setManualQuery(event.target.value)}
//             onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
//             placeholder="Try 90210 or Belmont MA"
//             aria-label="Lookup ZIP or city"
//           />
//           <button type="button" onClick={() => handleSearch()}>
//             <Search size={15} />
//             Search
//           </button>
//         </div>

//         {recent.length > 0 && (
//           <div className="lookup-recent">
//             {recent.map((item) => (
//               <button key={item} type="button" onClick={() => handleSearch(item)}>{item}</button>
//             ))}
//           </div>
//         )}

//         <div className="lookup-examples">
//           {EXAMPLES.map((example) => (
//             <button key={example} type="button" onClick={() => handleSearch(example)}>{example}</button>
//           ))}
//         </div>

//         {status === 'loading' && (
//           <div className="lookup-message loading">
//             <Loader2 size={16} className="spin" />
//             <span>Looking up location…</span>
//           </div>
//         )}

//         {status === 'error' && payload?.message && (
//           <div className="lookup-message error">
//             <AlertCircle size={16} />
//             <span>{payload.message}</span>
//           </div>
//         )}

//         {status === 'success' && places.length > 0 && (
//           <div className="lookup-result-box">
//             {places.map((place, index) => {
//               const city = place['place name']
//               const state = place.state || place['state abbreviation']
//               const zip = place['post code'] || payload.data['post code']
//               const lat = place.latitude
//               const lng = place.longitude

//               return (
//                 <div key={`${city}-${zip}-${index}`} className="lookup-result-item">
//                   <div className="lookup-result-header">
//                     <strong>{city}</strong>
//                     <button type="button" onClick={() => handleCopy(`${city} ${state} ${zip}`)}>
//                       <Copy size={14} />
//                     </button>
//                   </div>
//                   <div className="lookup-meta">
//                     <span>{state}</span>
//                     <span>{zip}</span>
//                   </div>
//                   <div className="lookup-coords">
//                     <span>Lat: {lat}</span>
//                     <span>Lng: {lng}</span>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Copy, Loader2, MapPin, Search } from 'lucide-react'
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

function buildLookupUrl(query) {
  const normalized = query.trim().replace(/\s+/g, ' ')
  if (!normalized) return null

  const zipMatch = normalized.match(/^\d{5}(?:-\d{4})?$/)
  if (zipMatch) {
    return { type: 'postal', url: `https://api.zippopotam.us/us/${encodeURIComponent(normalized)}` }
  }

  const commaMatch = normalized.match(/^(.+?),\s*([A-Za-z ]+)$/)
  const words = normalized.split(' ')
  const shortState = words.length > 1 && /^[A-Za-z]{2}$/.test(words[words.length - 1]) ? words.pop() : ''
  const fullState = Object.keys(STATE_ABBR).sort((a, b) => b.length - a.length).find((name) => normalized.toLowerCase().endsWith(` ${name}`))
  const city = commaMatch ? commaMatch[1].trim() : fullState ? normalized.slice(0, -(fullState.length + 1)).trim() : words.join(' ')
  const stateKey = commaMatch ? commaMatch[2].trim().toLowerCase() : (fullState || shortState).toLowerCase()
  const state = STATE_ABBR[stateKey] || stateKey.toUpperCase()

  if (city && state && state.length === 2) {
    return { type: 'city', url: `https://api.zippopotam.us/us/${encodeURIComponent(state)}/${encodeURIComponent(city)}` }
  }

  return null
}

// Builds a lookup URL straight from the structured NER entity the search
// platform hands us in searchData, instead of collapsing it back into a
// string and re-parsing it with buildLookupUrl. This matters because
// city-query entities carry city/state/country as separate fields
// (entityInfo.geo) — collapsing to entity.word alone (e.g. "Belmont")
// drops the state and the lookup can never resolve.
function buildLookupFromEntity(searchData) {
  const entity = searchData?.entities?.[0]
  if (!entity) return null

  if (entity.collectionName === 'ZIP_CODES') {
    const postal = entity.word
    const country = (entity.entityInfo?.Country || 'US').toLowerCase()
    if (!postal) return null
    return { type: 'postal', url: `https://api.zippopotam.us/${country}/${encodeURIComponent(postal)}` }
  }

  if (entity.collectionName === 'CITIES') {
    const geo = entity.entityInfo?.geo
    const city = geo?.city || entity.word
    const stateAbb = geo?.stateAbb
    const countryCode = (geo?.countryCode || 'US').toLowerCase()
    if (!city || !stateAbb) return null
    return { type: 'city', url: `https://api.zippopotam.us/${countryCode}/${encodeURIComponent(stateAbb)}/${encodeURIComponent(city)}` }
  }

  return null
}

export default function NewComponent({ searchData = null }) {
  const [status, setStatus] = useState('idle')
  const [payload, setPayload] = useState(null)
  const [manualQuery, setManualQuery] = useState('')
  const [recent, setRecent] = useState([])

  // Tracks the in-flight request so a newer search can cancel an older,
  // still-pending one instead of letting it resolve later and clobber
  // fresher results.
  const activeControllerRef = useRef(null)

  const derivedQuery = useMemo(() => {
    if (!searchData) return ''
    const queryTerm = searchData.queryTerm || searchData.query || searchData.keyword || ''
    if (queryTerm) return queryTerm
    const entity = searchData.entities?.[0]
    return entity?.word || entity?.description || ''
  }, [searchData])

  useEffect(() => {
    if (!derivedQuery) return
    setManualQuery(derivedQuery)
    // Pass the raw searchData through so runLookup can use the structured
    // entity fields (city/state/country) rather than re-parsing text.
    runLookup(derivedQuery, searchData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedQuery])

  // Cancel any pending request on unmount.
  useEffect(() => {
    return () => activeControllerRef.current?.abort()
  }, [])

  function pushRecent(term) {
    if (!term) return
    setRecent((prev) => {
      const next = [term, ...prev.filter((item) => item.toLowerCase() !== term.toLowerCase())]
      return next.slice(0, 5)
    })
  }

  function runLookup(query, sourceSearchData) {
    // Prefer the structured NER entity (has city/state/country as separate
    // fields) over re-parsing the flattened display string, which loses
    // information for city+state queries.
    const lookup = buildLookupFromEntity(sourceSearchData) || buildLookupUrl(query)
    if (!lookup) {
      activeControllerRef.current?.abort()
      setStatus('error')
      setPayload({ message: 'Enter a five-digit ZIP code or a city and state such as Belmont MA.' })
      return
    }

    // Supersede any request still in flight so it can't resolve later and
    // overwrite this newer search's results.
    activeControllerRef.current?.abort()

    setStatus('loading')
    setPayload(null)

    const controller = new AbortController()
    controller.timedOut = false
    activeControllerRef.current = controller

    const timeout = setTimeout(() => {
      controller.timedOut = true
      controller.abort()
    }, 8000)

    fetch(lookup.url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          const error = new Error('Lookup failed')
          error.status = response.status
          throw error
        }
        return response.json()
      })
      .then((data) => {
        setPayload({ type: lookup.type, data })
        setStatus('success')
        pushRecent(query)
      })
      .catch((error) => {
        if (error?.name === 'AbortError' && !controller.timedOut) {
          // Cancelled because a newer search took over — that search owns
          // the UI state now, so this one has nothing to report.
          return
        }
        const message = error?.status === 404
          ? 'No location was found for that search.'
          : error?.name === 'AbortError'
            ? 'The location service took too long to respond. Please try again.'
            : 'Could not reach the location service.'
        setStatus('error')
        setPayload({ message })
      })
      .finally(() => {
        clearTimeout(timeout)
        if (activeControllerRef.current === controller) {
          activeControllerRef.current = null
        }
      })
  }

  function handleSearch(term) {
    const query = (term ?? manualQuery).trim()
    if (!query) return
    setManualQuery(query)
    runLookup(query)
  }

  function handleCopy(value) {
    if (!value) return
    navigator.clipboard?.writeText(String(value))
  }

  const places = payload?.data?.places || []

  return (
    <div className="lookup-shell">
      <div className="lookup-card">
        <div className="lookup-header-row">
          <div className="lookup-title-wrap">
            <MapPin size={16} />
            <span>GeoResolve</span>
          </div>
        </div>

        <div className="lookup-search-row">
          <input
            type="text"
            value={manualQuery}
            onChange={(event) => setManualQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            placeholder="Try 90210 or Belmont MA"
            aria-label="Lookup ZIP or city"
          />
          <button type="button" onClick={() => handleSearch()}>
            <Search size={15} />
            Search
          </button>
        </div>

        {recent.length > 0 && (
          <div className="lookup-recent">
            {recent.map((item) => (
              <button key={item} type="button" onClick={() => handleSearch(item)}>{item}</button>
            ))}
          </div>
        )}

        <div className="lookup-examples">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => handleSearch(example)}>{example}</button>
          ))}
        </div>

        {status === 'loading' && (
          <div className="lookup-message loading">
            <Loader2 size={16} className="spin" />
            <span>Looking up location…</span>
          </div>
        )}

        {status === 'error' && payload?.message && (
          <div className="lookup-message error">
            <AlertCircle size={16} />
            <span>{payload.message}</span>
          </div>
        )}

        {status === 'success' && places.length > 0 && (
          <div className="lookup-result-box">
            {places.map((place, index) => {
              const city = place['place name']
              const state = place.state || place['state abbreviation']
              const zip = place['post code'] || payload.data['post code']
              const lat = place.latitude
              const lng = place.longitude

              return (
                <div key={`${city}-${zip}-${index}`} className="lookup-result-item">
                  <div className="lookup-result-header">
                    <strong>{city}</strong>
                    <button type="button" onClick={() => handleCopy(`${city} ${state} ${zip}`)}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="lookup-meta">
                    <span>{state}</span>
                    <span>{zip}</span>
                  </div>
                  <div className="lookup-coords">
                    <span>Lat: {lat}</span>
                    <span>Lng: {lng}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}