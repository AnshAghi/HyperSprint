export type LocationResult = {
  postalCode: string
  city: string
  state: string
  stateCode?: string
  country: string
  countryCode: string
  latitude: string
  longitude: string
}

export type LookupInput =
  | { mode: 'postal'; countryCode: string; postalCode: string }
  | { mode: 'city'; countryCode: string; state: string; city: string }

const SAMPLE_RESULTS: LocationResult[] = [
  { postalCode: '90210', city: 'Beverly Hills', state: 'California', stateCode: 'CA', country: 'United States', countryCode: 'US', latitude: '34.0901', longitude: '-118.4065' },
  { postalCode: '10001', city: 'New York', state: 'New York', stateCode: 'NY', country: 'United States', countryCode: 'US', latitude: '40.7506', longitude: '-73.9972' },
  { postalCode: '02478', city: 'Belmont', state: 'Massachusetts', stateCode: 'MA', country: 'United States', countryCode: 'US', latitude: '42.3959', longitude: '-71.1787' },
]

export async function lookupLocation(input: LookupInput): Promise<LocationResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 650))
  if (input.mode === 'postal') {
    const match = SAMPLE_RESULTS.filter((item) => item.postalCode === input.postalCode && item.countryCode === input.countryCode)
    if (!match.length) throw new Error('No location was found for that postal code.')
    return match
  }
  const match = SAMPLE_RESULTS.filter((item) => item.city.toLowerCase() === input.city.trim().toLowerCase() && item.stateCode === input.state.trim().toUpperCase())
  if (!match.length) throw new Error('No postal codes were found for that city and state.')
  return match
}