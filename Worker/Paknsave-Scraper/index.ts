// Scrape the paknsave API
import { writeFileSync } from 'fs';
const REQ_INTERVAL = 150; //ms
const BARCODE_CACHE = new Map();

interface SearchParams {
	search: string
	order?: string
	page?: number
	category?: string
}

interface APIError {
	status: string
	message: string
}

interface Store {
	address: string,
	banner: string,
	clickAndCollect: string,
	defaultCollectType: string,
	delivery: string,
	expressTimeslots: string,
	id: string,
	latitude: string,
	linkDetails: string,
	longitude: string,
	name: string,
	onboardingMode: string,
	onlineActive: string,
	openingHours: string,
	phone: string,
	physicalActive: string,
	physicalStoreCode: string,
	region: string,
	salesOrgId: string
}

async function fetch_retry(url: RequestInfo | URL, init?: RequestInit, retries?: number) {
	retries = retries ?? 5;
	for (let tries = 0; tries < retries; tries++) {
		let delay = Math.pow(REQ_INTERVAL, tries);
		await new Promise(resolve => setTimeout(resolve, delay));

		try {
			return await fetch(url, init);
		} catch (err) {
			console.warn(`(${tries + 1}/${retries}) Failed a request to ${url}, retrying`)
			if (tries == retries - 1) {
				throw err;
			}
		}
	}
}

const get_token = (function () {
	let curr: any;

	return async function () {
		if (!curr || Date.now() >= curr.expires) {
			let resp = await fetch_retry("https://www.paknsave.co.nz/CommonApi/Account/GetCurrentUser").then(x => x.json())
			curr = {
				token: resp.access_token,
				expires: Date.parse(resp.expires_time)
			};
		}

		return curr.token;
	}
})()

async function search(storeId: string, {
	search,
	order,
	page,
	category,
}: SearchParams) {

	const url = new URL("https://www.paknsave.co.nz/next/api/products/search")
	url.searchParams.set("storeId", storeId)
	url.searchParams.set("q", search)
	url.searchParams.set("s", order ?? "popularity")
	url.searchParams.set("pg", page?.toString() ?? "1")
	url.searchParams.set("ps", (999).toString())

	if (category != null) {
		url.searchParams.set("category", category);
	}

	return await fetch_retry(url).then(r => r.json()).then(j => {
		if ('errors' in j) {
			const errors = j.errors.map((x: APIError) => `'${x.status}: ${x.message}'`).join(", ");
			throw new Error(`Errors occured: ${errors}`);
		}

		return j;
	})
}

// TODO: Pre-check the database for existing barcodes
async function get_barcode(productId: string, storeId: string) {
	const token = await get_token();
	return await fetch_retry(`https://api-prod.prod.fsniwaikato.kiwi/prod/mobile/store/${storeId}/product/${productId}`, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer: ${token}`
		}
	}).then(x => x.json())
		.then(x => x?.sku)
}

async function get_stores(): Promise<Store[]> {
	const token = await get_token();
	return await fetch_retry("https://api-prod.newworld.co.nz/v1/edge/store", {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
		}
	}).then(x => x.json()).then(x => x.stores)
}

const get_category_items = async (category: string, storeId: string) => {
	console.log(`Checking category '${category}'`)

	return await search(storeId, { search: "", category })
		.then(j => j?.data?.products);
}

async function get_categories(storeId: string): Promise<Map<string, number>> {
	return await search(storeId, { search: "" })
		.then(j => {
			console.log(`Total expected items: ${j?.data?.total}`)
			return j?.data?.facets?.categories
		})
}


async function get_items_from_store(store: Store) {
	const categories = await get_categories(store.id)

	const categoryPromises = Object.entries(categories).map(async ([category, numItems], i) => {

		if (numItems > 1000) {
			throw new Error(`Category ${category}, has more than 1000 items, and thus we cannot` +
				` retrieve all items. Note, category has ${numItems} items`);
		}

		await new Promise(resolve => setTimeout(resolve, REQ_INTERVAL * i));
		const items = await get_category_items(category, store.id);

		if (items.length != numItems) {
			console.warn(`>>> Expected ${numItems} for category ${category}, but found ${items.length} items`)
		}

		for (const item of items) {
			item.category = category
		}

		return items;
	});

	const items = await Promise.all(categoryPromises).then(x => x.flat());
	console.log(`Found ${items.length} items`)

	const output = [];
	for(let i = 0; i < items.length; i++) {
		const x = items[i];

		let barcode = "";
		if (BARCODE_CACHE.has(x.productId)) {
			console.log(`(${i + 1}/${items.length}) Found ${x.name} in cache`)
			barcode = BARCODE_CACHE.get(x.productId);
		} else {
			console.log(`(${i + 1}/${items.length}) Fetching barcode for item ${x.name}`)
			barcode = await get_barcode(x.productId, store.id);
			BARCODE_CACHE.set(x.productId, barcode);
		}

		output.push({
			productID: x.productId,
			barcode: barcode,
			category: x.category,
			brand: x.brand,
			name: x.name,
			price: x.price,
			nonLoyaltyCardPrice: x.nonLoyaltyCardPrice,
			quantityType: x.saleType
		})
	}

	const { name, id, latitude, longitude } = store;
	return {
		storeName: name,
		storeID: id,
		storeLatitude: latitude,
		storeLongitude: longitude,
		items: output
	}
}

async function main() {
	const stores = await get_stores();
	for (const store of stores) {
		console.log(`Looking at store ${store.name}`);
		const items = await get_items_from_store(store).catch(console.error);
		writeFileSync(`out_${store.id}.json`, JSON.stringify(items));
		console.log(`Finished for store ${store.name}`);
	}
}

main()
