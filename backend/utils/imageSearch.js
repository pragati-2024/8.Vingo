import https from "node:https";

const PEXELS_ENDPOINT = "https://api.pexels.com/v1/search";

const toTokens = (value) => {
  if (!value || typeof value !== "string") return [];
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
};

const pickBestPhoto = (photos, query) => {
  if (!Array.isArray(photos) || photos.length === 0) return null;

  const queryLower = (query || "").toLowerCase();
  const queryTokens = toTokens(query);
  const badWords = new Set([
    "logo",
    "icon",
    "vector",
    "illustration",
    "clipart",
    "svg",
    "poster",
    "banner",
  ]);

  let best = photos[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const photo of photos) {
    const alt = typeof photo?.alt === "string" ? photo.alt : "";
    const altLower = alt.toLowerCase();
    const altTokensArr = toTokens(alt);
    const altTokens = new Set(altTokensArr);

    let score = 0;
    if (queryLower && altLower.includes(queryLower)) score += 30;

    for (const token of queryTokens) {
      if (altTokens.has(token)) {
        score += 10;
        continue;
      }

      // Partial matches help for plural/synonyms like burger <-> hamburger
      if (token.length >= 4) {
        const hasPartial = altTokensArr.some(
          (t) => t.includes(token) || token.includes(t),
        );
        if (hasPartial) score += 6;
      }
    }

    for (const bw of badWords) {
      if (altTokens.has(bw) || altLower.includes(bw)) score -= 25;
    }

    if (score > bestScore) {
      bestScore = score;
      best = photo;
    }
  }

  return best;
};

const getJson = (url, { headers = {}, timeoutMs = 10_000 } = {}) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers,
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          const statusCode = res.statusCode || 0;
          if (statusCode < 200 || statusCode >= 300) {
            resolve({ ok: false, statusCode, data: null });
            return;
          }

          try {
            const data = raw ? JSON.parse(raw) : null;
            resolve({ ok: true, statusCode, data });
          } catch {
            resolve({ ok: false, statusCode, data: null });
          }
        });
      },
    );

    req.on("error", (err) => reject(err));

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("timeout"));
    });

    req.end();
  });

export const searchImageUrl = async (query, { perPage = 1 } = {}) => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return "";
  if (!query || typeof query !== "string") return "";

  const effectivePerPage =
    typeof perPage === "number" && perPage > 0 ? Math.min(perPage, 15) : 10;

  const url = new URL(PEXELS_ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(effectivePerPage));
  url.searchParams.set("orientation", "landscape");

  let data;
  try {
    const res = await getJson(url, {
      timeoutMs: 10_000,
      headers: {
        Authorization: apiKey,
      },
    });
    if (!res.ok) return "";
    data = res.data;
  } catch {
    return "";
  }

  const photos = Array.isArray(data?.photos) ? data.photos : [];
  const photo = pickBestPhoto(photos, query);
  const src = photo?.src;
  // Prefer a reasonably sized image
  return (
    src?.large2x ||
    src?.large ||
    src?.landscape ||
    src?.medium ||
    src?.original ||
    ""
  );
};
