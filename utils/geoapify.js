// utils/geoapify.js
const API_KEY = process.env.GEOAPIFY_API_KEY;

// Node 18+ has global fetch
async function geocodeAddress(address) {
  if (!address) return null;
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", address);
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", API_KEY);

  const res = await fetch(url.href);
  if (!res.ok) return null;
  const data = await res.json();
  const feat = data?.features?.[0];
  if (!feat) return null;

  const lon = feat.geometry.coordinates[0];
  const lat = feat.geometry.coordinates[1];
  return { lon, lat, formatted: feat.properties.formatted };
}

async function searchSchoolByName(name, bias) {
  // bias: { lon, lat } optional
  const url = new URL("https://api.geoapify.com/v2/places");
  url.searchParams.set("categories", "education.school");
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", API_KEY);
  url.searchParams.set("text", name);
  if (bias?.lon != null && bias?.lat != null) {
    url.searchParams.set("bias", `proximity:${bias.lon},${bias.lat}`);
  }

  const res = await fetch(url.href);
  if (!res.ok) return null;
  const data = await res.json();
  const feat = data?.features?.[0];
  if (!feat) return null;

  const props = feat.properties || {};
  const lon = feat.geometry.coordinates[0];
  const lat = feat.geometry.coordinates[1];
  return {
    name: props.name || name,
    address: props.formatted,
    location: { type: "Point", coordinates: [lon, lat] },
    geoapify_id: props.place_id || props.datasource?.raw?.place_id || "",
  };
}

async function resolveTargetSchools(names = [], bias) {
  const out = [];
  for (const n of names) {
    const s = (n || "").trim();
    if (!s) continue;
    const found = await searchSchoolByName(s, bias);
    if (found) out.push(found);
  }
  return out;
}

module.exports = { geocodeAddress, resolveTargetSchools };
