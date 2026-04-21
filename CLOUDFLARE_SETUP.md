# Cloudflare setup for global visitor counts

This site is hosted on GitHub Pages, so global counting must be done by an external API.

## 1) Create Worker and KV

1. Go to Cloudflare dashboard.
2. Create a new Worker (Javascript).
3. Create a KV namespace, for example `visitor-map-kv`.
4. Bind the KV namespace to the Worker with variable name `VISIT_KV`.

## 2) Paste Worker code

Copy the full contents of `cloudflare-worker.js` into your Worker and deploy.

## 3) Route and CORS

- Use the default Worker URL (`https://<name>.<subdomain>.workers.dev`) or your custom domain.
- Current Worker CORS allows only `https://siyue-zhang.github.io`.

If you also test locally, update `Access-Control-Allow-Origin` in `cloudflare-worker.js`.

## 4) Connect the website

Open `index.html` and set:

```js
var WORKER_API_BASE = "https://YOUR-WORKER.workers.dev";
```

Replace with your real Worker URL.

## 5) Verify

After deployment, open your website and check:
- Map loads without errors.
- Refreshing from different browsers/devices increases shared country counts.

## API endpoints used by the page

- `GET /stats` -> returns `{ totalVisits, countries }`
- `POST /visit` with JSON body `{ country, lat, lng }` -> increments and returns updated stats
