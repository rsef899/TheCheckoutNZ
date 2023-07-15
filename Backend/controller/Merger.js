const axios = require('axios');
const fs = require('fs');
const countdownDataset = require('./CountdownScraper/countdown.json');
const newWorldDataset = require('./dummy.json');
const paknsaveDataset = require('./pakdummy.json');
const mergedData = {};
const stores = [];
let NWUrl = new URL('https://www.newworld.co.nz/next/api/products/search?');
let PakUrl = new URL('https://www.paknsave.co.nz/next/api/products/search?');
let NWconfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: NWUrl,
    headers: { 
      'Cookie': '__cf_bm=7w5pcG5GHgq9EibDngC4foIqIVz0rBfFXGvlVYpBKm4-1689324975-0-Aa3DoNUeUp8nKBzrNHTz0M5v6T1kAHUEdjwsmb7zUMTaULZOy5cqcVoDMiDLR5C9M7vc8K/f56daqglsQb7EJ3PGpAoLPSwYzr6uqfK+75V9; ASP.NET_SessionId=banwvlwk0ldcqzmdzu2s0aa0; SC_ANALYTICS_GLOBAL_COOKIE=59bd6b361451418ab6be94b8178cf264|False; SessionCookieIdV2=9f617474aeb44c64b9a51394f8a34f1d'
    }
  };
let Pakconfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: PakUrl,
    headers: { 
      'Cookie': '__cf_bm=DqJ6DAefMBisUko0EZN85lVhtmrc6juo04zY5wNNY4g-1689418178-0-AfKPwhkScXOiEroXyW/ekemD8aqtQt4LEEIGJ4LBzqQNrhV30aYrxrla9zya4LxGYiNkeBr2IDpcTt2M94H5Cg3q+3Y1LAavcXVf13ktpJof'
    }
};

// Adding countdown to the list of stores
stores.push({
    brand: "Countdown",
    storeName: "Countdown",
    storeID: "countdow-n111-11a1-1a1a-a1a1aa1aa111",
    Latitude: null,
    Longitude: null
});

// Adding all stores from New World into dataset
newWorldDataset.forEach(store => {
    stores.push({
        brand: "New World",
        storeName: store.storeName,
        storeID: store.storeID,
        Latitude: store.storeLatitude,
        Longitude: store.storeLongitude
    });
});

// Merge items with the same barcode

async function mergeItems() {
    for (const item1 of countdownDataset) {

        let prices = {};
        const countdownStoreID = stores[0].storeID;
        prices[countdownStoreID] = []; // Initialize prices[countdownStoreID] as an empty array
        prices[countdownStoreID].push({
            originalPrice: item1.price.originalPrice,
            salePrice: item1.price.salePrice,
            isLoyaltyCard: item1.price.isClubPrice
        }); // Pushing the countdown store into the list of matchedStores for the item
    
        let NewWorldName = null;
        let PaknSaveName = null;
        let productID = null;
        for (const store of newWorldDataset) {
            const matchedItem = store.items.find(item2 => item2.barcode === item1.barcode);
            if (matchedItem) {
                NewWorldName = matchedItem.name;
                if (!prices[store.storeID]) {
                    prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                }
                prices[store.storeID].push({
                    price: matchedItem.price,
                    nonLoyaltyCardPrice: matchedItem.nonLoyaltyCardPrice
                });
                productID = matchedItem.productID;
            } else if ((item1.brand === "fresh fruit") || (item1.brand === "fresh") || (item1.brand === "fresh vegetable")){ // If the barcode does not match and it is a fruit we now search the New World / Paknsave website
                NWUrl.searchParams.set("storeId",store.storeID);
                //console.log(`storeID: ${store.storeID}`);


                NWUrl.searchParams.set("q",item1.name);
                try {
                    // Delay of 150 ms
                    await new Promise(r => setTimeout(r,150));
                    let response = await axios.request(NWconfig);
                    let jObj = JSON.parse(JSON.stringify(response.data));
                    
                    let firstProduct = jObj.data.products[0];
                    if ((((firstProduct.unitOfMeasure === "g") || (firstProduct.unitOfMeasure === "Kg")) && (item1.unit === "Kg")) || ((firstProduct.saleType === 'UNITS') && (item1.unit === 'Each'))) {
                        NewWorldName = firstProduct.name;
                        productID = firstProduct.productID;
                        if (!prices[store.storeID]) {
                            prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                        }
                        prices[store.storeID].push({
                            price: firstProduct.price,
                            nonLoyaltyCardPrice: firstProduct.nonLoyaltyCardPrice
                        });
                    }
                    NewWorldName = firstProduct.name;
                    productID = firstProduct.productID;
                    if (!prices[store.storeID]) {
                        prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                    }
                    prices[store.storeID].push({
                        price: firstProduct.price,
                        nonLoyaltyCardPrice: firstProduct.nonLoyaltyCardPrice
                    });
                    
                } catch (error) {
                    console.error(`ERROR: ${error}`);
                }
            }
        };
        for (const store of paknsaveDataset) {
            const matchedItem = store.items.find(item2 => item2.barcode === item1.barcode);
            if (matchedItem) {
                PaknSaveName = matchedItem.name;
                if (!prices[store.storeID]) {
                    prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                }
                prices[store.storeID].push({
                    price: matchedItem.price,
                    nonLoyaltyCardPrice: matchedItem.nonLoyaltyCardPrice
                });
                productID = matchedItem.productID;
            } else if ((item1.brand === "fresh fruit") || (item1.brand === "fresh") || (item1.brand === "fresh vegetable")){ // If the barcode does not match and it is a fruit we now search the New World / Paknsave website
                PakUrl.searchParams.set("storeId",store.storeID);


                
                PakUrl.searchParams.set("q",item1.name);
                try {
                    // Delay of 150 ms

                    await new Promise(r => setTimeout(r,150));
                    console.log("pak");
                    let response = await axios.request(Pakconfig);
                    let jObj = JSON.parse(JSON.stringify(response.data));
                    
                    let firstProduct = jObj.data.products[0];
                    if ((((firstProduct.unitOfMeasure === "g") || (firstProduct.unitOfMeasure === "Kg")) && (item1.unit === "Kg")) || ((firstProduct.saleType === 'UNITS') && (item1.unit === 'Each'))) {
                        PaknSaveName = firstProduct.name;
                        productID = firstProduct.productID;
                        if (!prices[store.storeID]) {
                            prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                        }
                        prices[store.storeID].push({
                            price: firstProduct.price,
                            nonLoyaltyCardPrice: firstProduct.nonLoyaltyCardPrice
                        });
                    }
                        
                    
                } catch (error) {
                    console.error(`ERROR: ${error}`);
                }
            }

        };
        if (!mergedData[item1.barcode]) {
            mergedData[item1.barcode] = []
        };
        mergedData[item1.barcode].push({
            CountdownName: item1.name,
            NewWorldName: NewWorldName,
            PaknSaveName: PaknSaveName,
            brand: item1.brand,
            barcode: item1.barcode,
            unit: item1.unit,
            productID: productID,
            countdownProdID: item1.sku,
            prices
        });
    }
//     Add items from newWorldDataset with unique barcodes -- Not sure if works as expected

    for (const store of newWorldDataset) {
        
        for (const item of store.items) {
            let prices = {};
            const matchedItem = countdownDataset.find(item2 => item2.barcode === item.barcode);
            if (!prices[store.storeID]) {
                prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
            }
            prices[store.storeID].push({
                price: item.price,
                nonLoyaltyCardPrice: item.nonLoyaltyCardPrice
            });
            
            if (!matchedItem) {
                if (!mergedData[item.barcode]) {
                    mergedData[item.barcode] = []
                };

                mergedData[item.barcode].push({
                CountdownName: null,
                NewWorldName: NewWorldName,
                PaknSaveName: null,
                brand: item.category,
                barcode: item.barcode,
                unit: item.quanityType,
                productID: item.productID,
                countdownProdID: null,
                prices
                });
            }
        }
    
    }
    fs.writeFileSync("./controller/mergedData.json",JSON.stringify(mergedData,null,2));
}

mergeItems();




