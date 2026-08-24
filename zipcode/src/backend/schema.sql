CREATE TABLE IF NOT EXISTS postal_codes (
  country_code TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  place_name TEXT NOT NULL,
  admin1_name TEXT,
  admin1_code TEXT,
  admin2_name TEXT,
  admin2_code TEXT,
  admin3_name TEXT,
  admin3_code TEXT,
  latitude REAL,
  longitude REAL,
  accuracy INTEGER
);

CREATE INDEX IF NOT EXISTS idx_postal_codes_code ON postal_codes(country_code, postal_code);
CREATE INDEX IF NOT EXISTS idx_postal_codes_city ON postal_codes(country_code, place_name, admin1_code);