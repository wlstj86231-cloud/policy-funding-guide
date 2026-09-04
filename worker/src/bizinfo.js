const UPSTREAM_URL = "https://apis.data.go.kr/1421000/mssBizService_v2/getbizList_v2";
const ALLOWED_HOSTS = new Set(["policyfundpedia.com", "www.policyfundpedia.com"]);
const ALLOWED_PARAMS = new Set(["pageNo", "numOfRows", "cate"]);
const FRESH_MS = 5 * 60 * 1000;
const STALE_MS = 60 * 60 * 1000;
const MAX_UPSTREAM_BYTES = 2 * 1024 * 1024;

const ERROR_MESSAGES = {
	badRequest: "요청값이 올바르지 않습니다.",
	method: "지원하지 않는 요청 방식입니다.",
	host: "이 주소에서는 공고 API를 사용할 수 없습니다.",
	rateLimit: "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
	configuration: "공고 API 설정을 확인하고 있습니다.",
	upstream: "정부 공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	timeout: "정부 공고 응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.",
};

class RequestError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

class UpstreamError extends Error {}

function json(body, status = 200, headers = {}) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": status === 200 ? "public, max-age=60" : "no-store",
			"X-Content-Type-Options": "nosniff",
			...headers,
		},
	});
}

function failure(status, message, headers = {}) {
	return json({ success: false, error: message }, status, headers);
}

function readSingleParam(url, name) {
	const values = url.searchParams.getAll(name);
	if (values.length > 1) throw new RequestError(400, ERROR_MESSAGES.badRequest);
	return values[0] ?? "";
}

function readInteger(url, name, fallback, min, max) {
	const raw = readSingleParam(url, name);
	if (!raw) return fallback;
	if (!/^\d+$/.test(raw)) throw new RequestError(400, ERROR_MESSAGES.badRequest);
	const value = Number(raw);
	if (!Number.isSafeInteger(value) || value < min || value > max) {
		throw new RequestError(400, ERROR_MESSAGES.badRequest);
	}
	return value;
}

export function parseRequest(request) {
	const url = new URL(request.url);
	if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
		throw new RequestError(421, ERROR_MESSAGES.host);
	}
	if (url.pathname !== "/api/bizinfo") {
		throw new RequestError(404, "찾을 수 없습니다.");
	}
	if (request.method !== "GET") {
		throw new RequestError(405, ERROR_MESSAGES.method);
	}
	for (const key of url.searchParams.keys()) {
		if (!ALLOWED_PARAMS.has(key)) throw new RequestError(400, ERROR_MESSAGES.badRequest);
	}
	const category = readSingleParam(url, "cate").trim();
	if (category && category !== "전체") {
		throw new RequestError(400, "분야별 조회는 공식 분류 연동 후 제공됩니다.");
	}
	return {
		pageNo: readInteger(url, "pageNo", 1, 1, 1000),
		numOfRows: readInteger(url, "numOfRows", 15, 1, 30),
	};
}

function decodeEntities(value) {
	const codePoint = (raw, radix) => {
		const number = Number.parseInt(raw, radix);
		return Number.isInteger(number) && number >= 0 && number <= 0x10ffff
			? String.fromCodePoint(number)
			: "";
	};
	const named = {
		amp: "&", apos: "'", gt: ">", hellip: "…", ldquo: "“", lsquo: "‘",
		lt: "<", mdash: "—", middot: "·", nbsp: " ", ndash: "–", quot: '"',
		rdquo: "”", rsquo: "’", sim: "∼",
	};
	let decoded = String(value);
	for (let pass = 0; pass < 2; pass += 1) {
		const next = decoded
			.replace(/&#x([0-9a-f]+);/gi, (_, hex) => codePoint(hex, 16))
			.replace(/&#(\d+);/g, (_, decimal) => codePoint(decimal, 10))
			.replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
		if (next === decoded) break;
		decoded = next;
	}
	return decoded;
}

export function cleanText(value, maxLength = 2000) {
	const decoded = decodeEntities(String(value ?? "")
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
	const plain = decoded
		.replace(/<br\s*\/?\s*>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	return plain.slice(0, maxLength);
}

function tag(block, name) {
	const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i"));
	return match ? cleanText(match[1]) : "";
}

function safeUrl(value) {
	const cleaned = cleanText(value, 2048);
	if (!cleaned) return "";
	try {
		const parsed = new URL(cleaned);
		return parsed.protocol === "https:" ? parsed.href : "";
	} catch {
		return "";
	}
}

export function parseBizinfoXml(xml) {
	if (!/<response[\s>]/i.test(xml) || !/<totalCount>/i.test(xml)) {
		throw new UpstreamError("malformed upstream response");
	}
	const resultCode = tag(xml, "resultCode");
	if (resultCode && !["0", "00", "NORMAL_SERVICE"].includes(resultCode)) {
		throw new UpstreamError("upstream result code");
	}
	const items = [];
	for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
		const block = match[1];
		const title = tag(block, "title").slice(0, 300);
		if (!title) continue;
		items.push({
			title,
			url: safeUrl(tag(block, "viewUrl")),
			summary: tag(block, "dataContents").slice(0, 2000),
			startDate: tag(block, "applicationStartDate").slice(0, 50),
			endDate: tag(block, "applicationEndDate").slice(0, 50),
			org: tag(block, "writerName").slice(0, 200),
			category: "",
		});
	}
	const rawTotal = Number.parseInt(tag(xml, "totalCount"), 10);
	const totalCount = Number.isSafeInteger(rawTotal) && rawTotal >= 0
		? Math.min(rawTotal, 10_000_000)
		: items.length;
	return { success: true, totalCount, items };
}

function cacheFor(env) {
	return env.BIZINFO_CACHE ?? globalThis.caches?.default ?? null;
}

function cacheRequest({ pageNo, numOfRows }) {
	return new Request(`https://policyfundpedia.com/__worker-cache/bizinfo?pageNo=${pageNo}&numOfRows=${numOfRows}`);
}

async function responseFromCache(response, state) {
	const body = await response.text();
	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=60",
			"X-Content-Type-Options": "nosniff",
			"X-Bizinfo-Cache": state,
			...(state === "STALE" ? { Warning: '110 - "Response is stale"' } : {}),
		},
	});
}

export async function readLimitedBody(response, maxBytes = MAX_UPSTREAM_BYTES) {
	const rawLength = response.headers.get("content-length");
	if (rawLength !== null) {
		const declaredLength = Number(rawLength);
		if (!Number.isSafeInteger(declaredLength) || declaredLength < 0 || declaredLength > maxBytes) {
			try { await response.body?.cancel(); } catch {}
			throw new UpstreamError("upstream body too large");
		}
	}
	if (!response.body) return new Uint8Array();

	const reader = response.body.getReader();
	const chunks = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
			total += chunk.byteLength;
			if (total > maxBytes) {
				try { await reader.cancel(); } catch {}
				throw new UpstreamError("upstream body too large");
			}
			chunks.push(chunk);
		}
	} catch (error) {
		try { await reader.cancel(); } catch {}
		if (error instanceof UpstreamError) throw error;
		if (error?.name === "TimeoutError" || error?.name === "AbortError") throw error;
		throw new UpstreamError("upstream body read failed");
	}

	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return bytes;
}

async function fetchUpstream(params, env, fetchImpl) {
	if (!env.BIZINFO_API_KEY) throw new RequestError(503, ERROR_MESSAGES.configuration);
	if (!env.BIZINFO_RATE_LIMIT?.limit) throw new RequestError(503, ERROR_MESSAGES.configuration);
	const allowance = await env.BIZINFO_RATE_LIMIT.limit({ key: "bizinfo-upstream" });
	if (!allowance?.success) throw new RequestError(429, ERROR_MESSAGES.rateLimit);

	const url = new URL(UPSTREAM_URL);
	url.searchParams.set("serviceKey", env.BIZINFO_API_KEY);
	url.searchParams.set("pageNo", String(params.pageNo));
	url.searchParams.set("numOfRows", String(params.numOfRows));

	let response;
	try {
		response = await fetchImpl(url, { signal: AbortSignal.timeout(6000) });
	} catch (error) {
		if (error?.name === "TimeoutError" || error?.name === "AbortError") throw error;
		throw new UpstreamError("upstream request failed");
	}
	if (!response.ok) throw new UpstreamError("upstream status");
	const bytes = await readLimitedBody(response);
	return parseBizinfoXml(new TextDecoder().decode(bytes));
}

export async function handleBizinfo(request, env, ctx = {}, dependencies = {}) {
	let params;
	try {
		params = parseRequest(request);
	} catch (error) {
		if (error instanceof RequestError) {
			return failure(error.status, error.message, error.status === 405 ? { Allow: "GET" } : {});
		}
		return failure(400, ERROR_MESSAGES.badRequest);
	}

	const now = dependencies.now?.() ?? Date.now();
	let cache = dependencies.cache ?? cacheFor(env);
	const key = cacheRequest(params);
	let cached = null;
	let cachedAge = Number.POSITIVE_INFINITY;
	if (cache) {
		try {
			cached = await cache.match(key);
		} catch {
			cache = null;
		}
		const storedAt = Number(cached?.headers.get("X-Bizinfo-Cached-At"));
		if (Number.isFinite(storedAt)) cachedAge = Math.max(0, now - storedAt);
		if (cached && cachedAge <= FRESH_MS) return responseFromCache(cached, "HIT");
	}

	try {
		const payload = await fetchUpstream(params, env, dependencies.fetch ?? fetch);
		const clientResponse = json(payload, 200, { "X-Bizinfo-Cache": "MISS" });
		if (cache) {
			const stored = json(payload, 200, {
				"Cache-Control": `public, max-age=${STALE_MS / 1000}`,
				"X-Bizinfo-Cached-At": String(now),
			});
			const write = cache.put(key, stored).catch(() => undefined);
			if (typeof ctx.waitUntil === "function") ctx.waitUntil(write);
			else await write;
		}
		return clientResponse;
	} catch (error) {
		if (cached && cachedAge <= STALE_MS) return responseFromCache(cached, "STALE");
		if (error instanceof RequestError) return failure(error.status, error.message);
		const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
		return failure(timedOut ? 504 : 502, timedOut ? ERROR_MESSAGES.timeout : ERROR_MESSAGES.upstream);
	}
}
