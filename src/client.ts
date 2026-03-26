/**
 * TestRail API v2 HTTP client.
 *
 * Requires environment variables:
 *   TESTRAIL_URL      – e.g. https://yourinstance.testrail.io
 *   TESTRAIL_EMAIL    – user email
 *   TESTRAIL_API_KEY  – API key (generate under My Settings in TestRail)
 */

export interface TestRailConfig {
  baseUrl: string;
  email: string;
  apiKey: string;
}

function getConfig(): TestRailConfig {
  const baseUrl = process.env.TESTRAIL_URL;
  const email = process.env.TESTRAIL_EMAIL;
  const apiKey = process.env.TESTRAIL_API_KEY;

  if (!baseUrl || !email || !apiKey) {
    throw new Error(
      "Missing required environment variables: TESTRAIL_URL, TESTRAIL_EMAIL, TESTRAIL_API_KEY"
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    email,
    apiKey,
  };
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const config = getConfig();
  let url = `${config.baseUrl}/index.php?/api/v2/${endpoint}`;

  if (params) {
    const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
    if (filtered.length > 0) {
      url += "&" + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
    }
  }

  return url;
}

function authHeader(): string {
  const config = getConfig();
  return "Basic " + Buffer.from(`${config.email}:${config.apiKey}`).toString("base64");
}

export async function apiGet(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<unknown> {
  const url = buildUrl(endpoint, params);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TestRail API error ${res.status}: ${body}`);
  }

  return res.json();
}

export async function apiPost(
  endpoint: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = buildUrl(endpoint);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TestRail API error ${res.status}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
