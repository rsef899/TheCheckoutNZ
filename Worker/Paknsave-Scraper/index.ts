// Scrape the paknsave API
import { writeFileSync } from 'fs'

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

const get_token = (function() {
	let curr: any;

	return async function() {
		if (!curr || Date.now() >= curr.expires) {
			let resp = await fetch("https://www.paknsave.co.nz/CommonApi/Account/GetCurrentUser").then(x => x.json())
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

	return await fetch(url).then(r => r.json()).then(j => {
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
	await fetch(`https://api-prod.prod.fsniwaikato.kiwi/prod/mobile/store/${storeId}/product/${productId}`, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer: ${token}`
		}
	})
}

async function get_stores() {
	const token = await get_token();
	return await fetch("https://api-prod.newworld.co.nz/v1/edge/store", {
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


async function get_items_from_store(storeId: string) {
	const categories = await get_categories(storeId)

	const categoryPromises = Object.entries(categories).map(async ([category, numItems], i) => {

		if (numItems > 1000) {
			throw new Error(`Category ${category}, has more than 1000 items, and thus we cannot` +
				` retrieve all items. Note, category has ${numItems} items`);
		}

		await new Promise(resolve => setTimeout(resolve, 150 * i));
		const items = await get_category_items(category, storeId);

		if (items.length != numItems) {
			console.warn(`>>> Expected ${numItems} for category ${category}, but found ${items.length} items`)
		}

		return items;
	});

	const categoryItems = await Promise.all(categoryPromises);

	let items = categoryItems.flat();
	console.log(`Found ${items.length} items`)

	writeFileSync(`out_${storeId}.json`, JSON.stringify(items))
}

async function main() {
	const stores = await get_stores();
	for (const store of stores) {
		console.log(`Looking at store ${store.name}`);
		await get_items_from_store(store.id).catch(console.error);
		console.log(`Finished for store ${store.name}`);
	}
}

main()
