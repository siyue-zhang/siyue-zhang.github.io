export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://siyue-zhang.github.io",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/stats") {
      const stats = await getStats(env);
      return json(stats, 200, corsHeaders);
    }

    if (request.method === "POST" && url.pathname === "/visit") {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return json({ error: "invalid JSON" }, 400, corsHeaders);
      }

      const country = normalizeCountry(payload.country);
      const lat = Number(payload.lat);
      const lng = Number(payload.lng);

      const stats = await getStats(env);
      addCountryCount(stats, country, lat, lng, 1);
      stats.totalVisits = Number(stats.totalVisits || 0) + 1;

      await env.VISIT_KV.put("visitor-map-stats-v1", JSON.stringify(stats));
      return json(stats, 200, corsHeaders);
    }

    return json({ error: "not found" }, 404, corsHeaders);
  }
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}

async function getStats(env) {
  const raw = await env.VISIT_KV.get("visitor-map-stats-v1");
  if (!raw) {
    return { totalVisits: 0, countries: {} };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { totalVisits: 0, countries: {} };
    }
    if (!parsed.countries || typeof parsed.countries !== "object") {
      parsed.countries = {};
    }
    parsed.totalVisits = Number(parsed.totalVisits || 0);
    return parsed;
  } catch {
    return { totalVisits: 0, countries: {} };
  }
}

function normalizeCountry(country) {
  const clean = (country || "").toString().trim();
  return clean || "Unknown Country";
}

function addCountryCount(stats, country, lat, lng, count) {
  const key = country;
  const numericCount = Math.max(1, Number(count) || 1);

  if (!stats.countries[key]) {
    stats.countries[key] = {
      country: key,
      lat: Number.isFinite(lat) ? lat : 20,
      lng: Number.isFinite(lng) ? lng : 0,
      count: 0
    };
  }

  stats.countries[key].count += numericCount;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    stats.countries[key].lat = (stats.countries[key].lat + lat) / 2;
    stats.countries[key].lng = (stats.countries[key].lng + lng) / 2;
  }
}
