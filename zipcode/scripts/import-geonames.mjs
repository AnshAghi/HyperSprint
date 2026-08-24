import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dataDir = resolve(root, 'data')
const archive = resolve(dataDir, 'allCountries.zip')
const textFile = resolve(dataDir, 'allCountries.txt')
const database = resolve(dataDir, 'geonames.sqlite')

if (!existsSync(textFile)) {
  throw new Error(`Missing ${textFile}. Download and extract allCountries.zip first.`)
}

mkdirSync(dataDir, { recursive: true })
const sql = `
DROP TABLE IF EXISTS postal_codes;
CREATE TABLE postal_codes (
  country_code TEXT NOT NULL, postal_code TEXT NOT NULL, place_name TEXT NOT NULL,
  admin1_name TEXT, admin1_code TEXT, admin2_name TEXT, admin2_code TEXT,
  admin3_name TEXT, admin3_code TEXT, latitude REAL, longitude REAL, accuracy INTEGER
);
.mode tabs
.import '${textFile.replaceAll('\\', '/')}' postal_codes
CREATE INDEX idx_postal_codes_code ON postal_codes(country_code, postal_code);
CREATE INDEX idx_postal_codes_city ON postal_codes(country_code, place_name, admin1_code);
`

execFileSync('sqlite3', [database], { input: sql, stdio: ['pipe', 'inherit', 'inherit'] })
console.log(`Imported GeoNames postal data into ${database}`)
console.log(`Source archive: ${archive}`)