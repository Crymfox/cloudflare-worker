/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	vue_example_store: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response | void> {
		return await handleRequest(request, env, ctx).catch((err) => {
			new Response(err.stack || err, { status: 500 });
		});
	},
};

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;

	if (path === "/") {
		// connect to KV
		const store = env.vue_example_store;
		// get all keys and values from KV
		const keys = await store.list();
		const values = await Promise.all(keys.keys.map(async (key) => {
			return {
				key: key.name,
				value: await store.get(key.name),
			};
		}));
		// return a JSON response
		return new Response(JSON.stringify(values));
		
		// return new Response("Hello world!");
	} else if (path === "/put") {
		const value = await request.json() as { key: string, value: string };
		const store = env.vue_example_store;
		await store.put(value.key, value.value);
		return new Response(value.key + " " + value.value);
	} else {
		return new Response("Not found", { status: 404 });
	}
}
