/**
 * Mapbox Geocoding Service (React Native)
 *
 * Validates if an address physically exists using the Mapbox Geocoding API.
 * Mirrors WebAluna's geocodingService + useAddressValidation logic exactly.
 *
 * Token: EXPO_PUBLIC_MAPBOX_TOKEN (public token, safe for client use)
 * Country: AR (Argentina)
 */

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

/** Mirrors WebAluna's isValidMatch — filters low-relevance results. */
function isValidMatch(feature, query) {
  if (feature.relevance < 0.4) return false;
  const queryLower = query.toLowerCase();
  const placeLower = feature.place_name.toLowerCase();
  const queryParts = queryLower
    .split(/[,\s]+/)
    .filter(
      (p) =>
        p.length > 2 && !["de", "en", "la", "el", "y", "argentina"].includes(p),
    );
  if (queryParts.length > 0) {
    const hits = queryParts.filter((p) => placeLower.includes(p));
    if (hits.length / queryParts.length < 0.4) return false;
  }
  return true;
}

/** Geocodes a full address string. */
async function geocodeAddress(address) {
  if (!MAPBOX_TOKEN) {
    return {
      success: false,
      results: [],
      error: "Token de Mapbox no configurado",
    };
  }
  try {
    const encoded = encodeURIComponent(address.trim());
    const url =
      `${BASE_URL}/${encoded}.json` +
      `?access_token=${MAPBOX_TOKEN}` +
      `&country=AR&types=place,address,postcode&limit=5`;

    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, results: [], error: `Error ${response.status}` };
    }
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      return { success: false, results: [], message: "Sin resultados" };
    }
    const valid = data.features
      .filter((f) => isValidMatch(f, address))
      .map((f) => ({
        id: f.id,
        address: f.place_name,
        relevance: f.relevance,
      }));
    if (valid.length === 0) {
      return {
        success: false,
        results: [],
        message: "Sin coincidencias exactas",
      };
    }
    return { success: true, results: valid };
  } catch (error) {
    return { success: false, results: [], error: error.message };
  }
}

/** Checks number and street name match in the result.
 * NOTE: We intentionally skip postalCode/region checks because Mapbox's
 * place_name typically doesn't include them verbatim. */
function validateAddressMatch(query, resultAddress) {
  const resultLower = resultAddress.toLowerCase();

  // Check street number — only the first number in the query (e.g. "3900")
  const numberMatch = query.match(/\s(\d+)/);
  const queryNumber = numberMatch ? numberMatch[1] : null;
  if (queryNumber && !resultLower.includes(queryNumber)) {
    return {
      isValid: false,
      reason: "La altura no coincide con esta dirección",
    };
  }

  // Check street name (text before the first digit)
  const streetMatch = query.match(/^([^0-9]+)/);
  const queryStreet = streetMatch ? streetMatch[1].trim().toLowerCase() : null;
  if (
    queryStreet &&
    queryStreet.length > 2 &&
    !resultLower.includes(queryStreet)
  ) {
    return {
      isValid: false,
      reason: "La calle no coincide con la dirección encontrada",
    };
  }

  return { isValid: true, reason: null };
}

/**
 * Validates that an address object (street, number, city, region, postalCode)
 * corresponds to a real address using Mapbox Geocoding.
 * Mirrors WebAluna's validateAddressObject from useAddressValidation.
 *
 * @param {Object} addressObj - { street, number, city, region, postalCode }
 * @returns {Promise<{ status: 'success'|'error', message: string }>}
 */
export async function validateAddressObject(addressObj) {
  const { street, number, city, region, postalCode } = addressObj;
  if (
    !street?.trim() ||
    !number ||
    !city?.trim() ||
    !region?.trim() ||
    !postalCode?.trim()
  ) {
    return {
      status: "error",
      message: "Completá todos los campos para validar la dirección",
    };
  }

  // Build query exactly as WebAluna does: street number, city, region postalCode
  const query = `${street.trim()} ${number}, ${city.trim()}, ${region.trim()} ${postalCode.trim()}`;

  const geocodeResult = await geocodeAddress(query);
  if (!geocodeResult.success || geocodeResult.results.length === 0) {
    return {
      status: "error",
      message: "No encontramos esta dirección. Verificá que sea correcta.",
    };
  }

  const match = validateAddressMatch(query, geocodeResult.results[0].address);
  if (!match.isValid) {
    return { status: "error", message: match.reason };
  }

  return {
    status: "success",
    message: `Dirección validada: ${geocodeResult.results[0].address}`,
  };
}
