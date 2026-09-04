import policyfund from "./policyfund-live-baseline.js";
import { handleBizinfo } from "./bizinfo.js";

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (url.pathname === "/api/bizinfo") {
			return handleBizinfo(request, env, ctx);
		}
		return policyfund.fetch(request, env, ctx);
	},
};

