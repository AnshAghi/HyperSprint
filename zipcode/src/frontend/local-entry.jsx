// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import { withHD } from '@hyperdart/frontend'
// import NewComponent from './NewComponent'
// import '../sandbox/index.css'

// const sampleSearchData = {
//   query: '90210',
//   queryTerm: '90210',
//   keyword: '90210',
//   entities: [
//     { collectionName: 'ZIP_CODES', word: '90210', description: '90210' },
//   ],
// }

// const HyperDartComponent = withHD(NewComponent)

// createRoot(document.getElementById('root')).render(
//   <HyperDartComponent
//     searchData={sampleSearchData}
//     baseURL="/"
//     UIOptions={{ format: { sidebar: true }, sandbox: true }}
//   />
// )
import React from 'react'
import { createRoot } from 'react-dom/client'
import { withHD } from '@hyperdart/frontend'
import NewComponent from './NewComponent'
import '../sandbox/index.css'

// Real searchData payloads from the hackathon doc, used to sanity-check
// both lookup paths through the actual entity parser in NewComponent.jsx
// (buildLookupFromEntity), not just the manual-text fallback.

// Example 1: "Zip code 90210" — ZIP_CODES entity
const zipSearchData = {
  component: '@hyperdart/zipfinder',
  componentID: 0,
  componentPrimaryName: '',
  templateID: 0,
  entities: [
    {
      word: '90210',
      wgID: 1001,
      wgName: 'CITIES',
      collectionName: 'ZIP_CODES',
      collectionType: 'HD_LOCATION',
      wgUGC: 0,
      templateID: 0,
      entityInfo: { Country: 'US' },
      compInfo: null,
      entityType: 'LOCATION',
      sourceID: 'Q127856',
      IDs: null,
      componentName: '@hyperdart/zipfinder',
      componentID: 0,
      info: { Type: 'zipCodes' },
      description: 'Beverly Hills',
      qualifierReqd: 0,
      priority: 5,
      isEnabled: 1,
      keywordRequired: 0,
      primaryText: '',
      relevanceScore: 80.19,
      sourceValue: 34658,
      index: 9,
      wgInfo: { Type: 'zipCodes' },
      primaryID: 'Q127856',
    },
  ],
  query: 'Zip code 90210',
  componentEnabled: true,
  keyword: [{ word: 'zip code', description: '' }],
  compInfo: null,
  queryTerm: 'zip code 90210',
  disambiguationType: 3,
  ugc: false,
  qualifierReqd: false,
  genericQuery: 'zip code HD_LOCATION__ZIP_CODES',
  unambiguous: true,
  unresolvedQuery: '',
  queryRegex: 'zip\\s*code\\s+HD_LOCATION__ZIP_CODES.*',
  wgUGC: false,
  quickView: 3,
  suggestedPlace: 'sidebar',
  componentType: 'internal',
}

// Example 2: "Zip codes for Belmont Massachusetts" — CITIES entity with
// city/state/country as separate fields under entityInfo.geo. This is the
// payload that previously produced no result box before the
// buildLookupFromEntity fix, because entity.word alone ("Belmont") has no
// state and the old parser had nothing to build a valid endpoint from.
const citySearchData = {
  component: '@hyperdart/zipfinder',
  componentID: 0,
  componentPrimaryName: '',
  templateID: 0,
  entities: [
    {
      word: 'Belmont',
      wgID: 1000,
      wgName: 'CITIES',
      collectionName: 'CITIES',
      collectionType: 'HD_LOCATION',
      wgUGC: 0,
      templateID: 0,
      entityInfo: {
        geo: {
          tz: 'America/Los_Angeles',
          lat: 37.52021,
          city: 'Belmont',
          long: -122.2758,
          state: 'California',
          country: 'United States',
          district: 'San Mateo County',
          stateAbb: 'CA',
          stateCode: 'US.CA',
          countryQID: 'Q30',
          countryCode: 'US',
          districtCode: 'US.CA.081',
        },
        labelSource: 'wiki',
      },
      compInfo: null,
      entityType: 'LOCATION',
      sourceID: '5327455',
      IDs: { wikiQID: 'Q816099', TPcityID: 17008, geonameID: 5327455 },
      componentName: '@hyperdart/zipfinder',
      componentID: 0,
      info: { Type: 'cities' },
      description: 'city in California, United States',
      qualifierReqd: 0,
      priority: 7,
      isEnabled: 1,
      keywordRequired: 0,
      primaryText: '',
      relevanceScore: 90.15,
      sourceValue: 27218,
      index: 14,
      wgInfo: { Type: 'cities' },
      primaryID: '5327455',
    },
  ],
  query: 'Zip codes for Belmont Massachusetts',
  componentEnabled: true,
  keyword: [],
  compInfo: null,
  queryTerm: 'zip codes for belmont massachusetts',
  disambiguationType: 2,
  ugc: false,
  qualifierReqd: false,
  genericQuery: 'zip codes for HD_LOCATION__CITIES massachusetts',
  unresolvedQuery: '',
  unambiguous: true,
  queryRegex: '(zip|postal)\\s*codes?\\s+(for|in)\\s+HD_LOCATION__CITIES.*',
  wgUGC: false,
  quickView: 3,
  suggestedPlace: 'sidebar',
  componentType: 'internal',
}

// Flip this to citySearchData to verify the city+state path instead.
const sampleSearchData = zipSearchData

const HyperDartComponent = withHD(NewComponent)

createRoot(document.getElementById('root')).render(
  <HyperDartComponent
    searchData={sampleSearchData}
    baseURL="/"
    UIOptions={{ format: { sidebar: true }, sandbox: true }}
  />
)