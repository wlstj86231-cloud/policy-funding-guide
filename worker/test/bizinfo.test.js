import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, handleBizinfo, parseBizinfoXml, parseRequest, readLimitedBody } from "../src/bizinfo.js";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<response><header><resultCode>00</resultCode></header><body><totalCount>1</totalCount><items><item>
<title><![CDATA[안전한 <b>공고</b> &amp; 안내]]></title>
<dataContents><![CDATA[<p>지원 <strong>내용</strong></p>]]></dataContents>
<viewUrl>https://www.bizinfo.go.kr/example?a=1&amp;b=2</viewUrl>
<applicationStartDate>2026-09-01</applicationStartDate><applicationEndDate>2026-09-30</applicationEndDate>
<writerName>중소벤처기업부</writerName></item></items></body></response>`;

function env(overrides = {}) {
	return {
		BIZINFO_API_KEY: "test-key",
		BIZINFO_RATE_LIMIT: { limit: async () => ({ success: true }) },
		...overrides,
	};
}

function upstream(body = XML, init = {}) {
	return async (url) => {
		assert.equal(url.searchParams.get("serviceKey"), "test-key");
		return new Response(body, { status: 200, ...init });
	};
}

class MemoryCache {
	constructor() { this.values = new Map(); }
	async match(request) { return this.values.get(request.url)?.clone(); }
	async put(request, response) { this.values.set(request.url, response.clone()); }
}

test("request contract is narrow and bounded", () => {
	assert.deepEqual(parseRequest(new Request("https://policyfundpedia.com/api/bizinfo?pageNo=2&numOfRows=30")), { pageNo: 2, numOfRows: 30 });
	assert.deepEqual(parseRequest(new Request("https://policyfundpedia.com/api/bizinfo?pageNo=101")), { pageNo: 101, numOfRows: 15 });
	assert.throws(() => parseRequest(new Request("https://policyfundpedia.com/api/bizinfo?pageNo=1&pageNo=2")));
	assert.throws(() => parseRequest(new Request("https://policyfundpedia.com/api/bizinfo?pageNo=1001")));
	assert.throws(() => parseRequest(new Request("https://policyfundpedia.com/api/bizinfo?numOfRows=31")));
	assert.throws(() => parseRequest(new Request("https://policyfundpedia.com/api/bizinfo?region=충북")));
	assert.throws(() => parseRequest(new Request("https://policyfund-api.example.workers.dev/api/bizinfo")));
});

test("XML is normalized to the existing client contract", () => {
	assert.deepEqual(parseBizinfoXml(XML), {
		success: true,
		totalCount: 1,
		items: [{
			title: "안전한 공고 & 안내",
			url: "https://www.bizinfo.go.kr/example?a=1&b=2",
			summary: "지원 내용",
			startDate: "2026-09-01",
			endDate: "2026-09-30",
			org: "중소벤처기업부",
			category: "",
		}],
	});
	assert.equal(cleanText("<script>alert(1)</script> 설명"), "alert(1) 설명");
});

test("unsafe upstream links are removed", () => {
	const payload = parseBizinfoXml(XML.replace("https://www.bizinfo.go.kr/example?a=1&amp;b=2", "javascript:alert(1)"));
	assert.equal(payload.items[0].url, "");
});

test("malformed and failed upstream payloads are rejected", () => {
	assert.throws(() => parseBizinfoXml("<html>maintenance</html>"));
	assert.throws(() => parseBizinfoXml(XML.replace("<resultCode>00</resultCode>", "<resultCode>20</resultCode>")));
	assert.doesNotThrow(() => cleanText("&#999999999; 설명"));
	assert.equal(cleanText("A&nbsp;&middot;&amp;nbsp;B"), "A · B");
	assert.equal(cleanText("&lt;b&gt;안내&lt;/b&gt;"), "안내");
});

test("a body without content-length is cancelled as soon as it exceeds the limit", async () => {
	let cancelled = false;
	const chunk = new Uint8Array(8);
	const body = new ReadableStream({
		pull(controller) { controller.enqueue(chunk); },
		cancel() { cancelled = true; },
	});
	await assert.rejects(() => readLimitedBody(new Response(body), 16));
	assert.equal(cancelled, true);
});

test("an oversized declared body is cancelled before it is read", async () => {
	let cancelled = false;
	const body = new ReadableStream({ cancel() { cancelled = true; } });
	const response = new Response(body, { headers: { "content-length": "17" } });
	await assert.rejects(() => readLimitedBody(response, 16));
	assert.equal(cancelled, true);
});

test("a body timeout remains a timeout response", async () => {
	const response = await handleBizinfo(
		new Request("https://policyfundpedia.com/api/bizinfo"),
		env(),
		{},
		{
			fetch: async () => new Response(new ReadableStream({
				pull() {
					const error = new Error("late body");
					error.name = "TimeoutError";
					throw error;
				},
			})),
			cache: new MemoryCache(),
		},
	);
	assert.equal(response.status, 504);
});

test("successful responses are cached and a cache hit skips upstream", async () => {
	const cache = new MemoryCache();
	let calls = 0;
	const fetch = async (...args) => { calls += 1; return upstream()(...args); };
	const request = new Request("https://policyfundpedia.com/api/bizinfo");
	const first = await handleBizinfo(request, env(), {}, { fetch, cache, now: () => 1000 });
	assert.equal(first.status, 200);
	assert.equal(first.headers.get("X-Bizinfo-Cache"), "MISS");
	const second = await handleBizinfo(request, env(), {}, { fetch, cache, now: () => 2000 });
	assert.equal(second.headers.get("X-Bizinfo-Cache"), "HIT");
	assert.equal(calls, 1);
});

test("a recent last-good response is served when upstream fails", async () => {
	const cache = new MemoryCache();
	const request = new Request("https://policyfundpedia.com/api/bizinfo");
	await handleBizinfo(request, env(), {}, { fetch: upstream(), cache, now: () => 1000 });
	const response = await handleBizinfo(request, env(), {}, {
		fetch: async () => { throw new Error("offline"); },
		cache,
		now: () => 6 * 60 * 1000,
	});
	assert.equal(response.status, 200);
	assert.equal(response.headers.get("X-Bizinfo-Cache"), "STALE");
});

test("upstream errors are classified without leaking details", async () => {
	const request = new Request("https://policyfundpedia.com/api/bizinfo");
	const response = await handleBizinfo(request, env(), {}, {
		fetch: async () => new Response("failed", { status: 500 }),
		cache: new MemoryCache(),
	});
	assert.equal(response.status, 502);
	assert.deepEqual(await response.json(), { success: false, error: "정부 공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." });
});

test("rate limiting is enforced before an upstream request", async () => {
	let called = false;
	const response = await handleBizinfo(
		new Request("https://policyfundpedia.com/api/bizinfo"),
		env({ BIZINFO_RATE_LIMIT: { limit: async () => ({ success: false }) } }),
		{},
		{ fetch: async () => { called = true; return new Response(XML); }, cache: new MemoryCache() },
	);
	assert.equal(response.status, 429);
	assert.equal(called, false);
});

test("cache failure does not block a valid upstream response", async () => {
	const brokenCache = {
		match: async () => { throw new Error("cache unavailable"); },
		put: async () => { throw new Error("cache unavailable"); },
	};
	const response = await handleBizinfo(
		new Request("https://policyfundpedia.com/api/bizinfo"),
		env(),
		{},
		{ fetch: upstream(), cache: brokenCache },
	);
	assert.equal(response.status, 200);
});
