// Scrape the paknsave API

async function search(storeId, {
	search = "",
	order = "popularity",
	page = 1,
	category = null
} = {}) {
	category = category?.replaceAll(" ", "+");
	const url = new URL("https://www.paknsave.co.nz/next/api/products/search")
	url.searchParams.set("storeId", storeId)
	url.searchParams.set("q", search)
	url.searchParams.set("s", order)
	url.searchParams.set("pg", page)

	if (category != null) {
		url.searchParams.set("category", category);
	}

	return await fetch(url).then(r => r.json()).then(j => {
		if('errors' in j) {
			const errors = j.errors.map(x => `'${x.status}: ${x.message}'`).join(", ");
			throw new Error(`Errors occured: ${errors}`);
		}

		return j;
	})
}

const getCategoryItems = async (category, storeId) =>
	await search(storeId, { category })
		.then(j => j?.data?.products)

const getCategories = async storeId =>
	await search(storeId, {})
		.then(j => j?.data?.facets?.categories)


async function main() {
	const storeId = "e1925ea7-01bc-4358-ae7c-c6502da5ab12"
	const categories = await getCategories(storeId)

	const allItems = new Set();

	Object.entries(categories).reduce(
		(set, [category, numItems]) => {
			console.log(`Checking category '${category}'`)

			if (numItems > 1000) {
				throw new Error(`Category ${category}, has more than 1000 items, and thus we cannot` +
					` retrieve all items. Note, category has ${numItems} items`);
			}

			getCategoryItems(category, storeId)
				.then(items => items.forEach(item => set.add(item)));
			return set;
		},
		allItems
	)

	return allItems;
}

main()
