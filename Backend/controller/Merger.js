const axios = require('axios');
const fs = require('fs');
const countdownDataset = require('./CountdownScraper/countdown.json');
const newWorldDataset = require('./dummy.json');
const paknsaveDataset = require('./pakdummy.json');
const stringSimilarity = require('string-similarity');
const mergedData = [];
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

// Removing unwanted strings from the names when trying to compare the names
function cleanString(str) {
    const excludedWords = ["countdown", "fresh fruit", "fresh vegetable","half", "pre-ripened"];
    const regex = new RegExp(excludedWords.join("|"), "gi");
    return str.replace(regex, "").trim();
}
    

// Merge items with the same barcode
async function mergeItems() {
    const NewWorldProdIDs = [];
    const PaknSaveProdIDs = [];
    
    for (const item1 of countdownDataset) {
        let newWorldFound = false;
        let pakFound = false;
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
                newWorldFound = true;
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


                NWUrl.searchParams.set("q",encodeURI(cleanString(item1.name)));
                try {
                    // Delay of 150 ms
                    await new Promise(r => setTimeout(r,150));
                    // Setting up system to find the best match
                    let NWMatch = null;
                    let NWScore = 0;
                    let response = await axios.request(NWconfig);
                    let jObj = JSON.parse(JSON.stringify(response.data));
                    
                    let firstProducts = jObj.data.products.slice(0,3);
                    for (const product of firstProducts) {
                        if ((((product.unitOfMeasure === "g") || (product.unitOfMeasure === "Kg")) && (item1.unit === "Kg")) || ((product.saleType === 'UNITS') && (item1.unit === 'Each'))) {
                            
                            const simScore = stringSimilarity.compareTwoStrings(cleanString(product.name),cleanString(item1.name));
                            console.log(`ITEM: ${item1.name}  NW item: ${product.name} PRODID: ${product.productId} \n CONTAINED: ${NewWorldProdIDs.includes(product.productID)} PRODID's : ${NewWorldProdIDs}`);
                            if (simScore > NWScore) {
                                NWScore = simScore;
                                NWMatch = product
                            }
                        }
                    }
                    if (NWScore >= 0.6 && !NewWorldProdIDs.includes(NWMatch.productId)) { //If the match is ~70% accurate then:
                        NewWorldName = NWMatch.name;
                        productID = NWMatch.productId;
                        newWorldFound = true;
                        
                        console.log(`FOUND NW : ${NewWorldName}`)
                        if (!prices[store.storeID]) {
                            prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                        }
                        prices[store.storeID].push({
                            price: NWMatch.price,
                            nonLoyaltyCardPrice: NWMatch.nonLoyaltyCardPrice
                            
                        });
                    }
                } catch (error) {
                    console.error(`ERROR: ${error}`);
                }
            }
        };
        for (const store of paknsaveDataset) {
            const matchedItem = store.items.find(item2 => item2.barcode === item1.barcode);
            if (matchedItem) {
                pakFound = true;
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
                PakUrl.searchParams.set("q",encodeURI(cleanString(item1.name)));
                try {
                    // Delay of 150 ms
                    await new Promise(r => setTimeout(r,150));
                    let response = await axios.request(Pakconfig);
                    let jObj = JSON.parse(JSON.stringify(response.data));
                    let pakScore = 0;
                    let pakMatch = null;
                    
                    let firstProducts = jObj.data.products.slice(0);
                    for (const product of firstProducts) {
                        if ((((product.unitOfMeasure === "g") || (product.unitOfMeasure === "Kg")) && (item1.unit === "Kg")) || ((product.saleType === 'UNITS') && (item1.unit === 'Each'))) {
                            
                            const simScore = stringSimilarity.compareTwoStrings(cleanString(product.name),cleanString(item1.name));
                            if (simScore > pakScore) {
                                pakScore = simScore;
                                pakMatch = product
                            }
                        }
                    }
                    if (pakScore >= 0.6 && !PaknSaveProdIDs.includes(pakMatch.productId)) { //If the match is ~60% accurate then:
                        PaknSaveName = pakMatch.name;
                        pakFound = true;
                        productID = pakMatch.productId;
                        
                        console.log(`FOUND PAK : ${PaknSaveName}`)
                        if (!prices[store.storeID]) {
                            prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
                        }
                        prices[store.storeID].push({
                            price: pakMatch.price,
                            nonLoyaltyCardPrice: pakMatch.nonLoyaltyCardPrice
                        });
                    }


                    
                        
                    
                } catch (error) {
                    console.error(`ERROR: ${error}`);
                }
            }

        };
        if (!mergedData[item1.barcode]) {
            mergedData[item1.barcode] = {};
        }
        mergedData[item1.barcode] = {
            barcode: item1.barcode,
            CountdownName: item1.name,
            NewWorldName: NewWorldName,
            PaknSaveName: PaknSaveName,
            brand: item1.brand,
            unit: item1.unit,
            productID: productID,
            countdownProdID: item1.sku,
            prices: prices
        };
        if (pakFound) {
            PaknSaveProdIDs.push(productID);

        }
        if (newWorldFound) {
            NewWorldProdIDs.push(productID);
        }
    }
    // Add items from newWorldDataset with unique barcodes -- Needs to be tested more extensively

    for (const store of newWorldDataset) {
        
        for (const item of store.items) {

           
            // Seeing if an item matches that barcode of one in the countdownDataset
            const countdownMatch = countdownDataset.find(item2 => (item2.barcode === item.barcode)); 
            if (!countdownMatch && !NewWorldProdIDs.includes(item.productID)) { 
                // If the item does not match the barcode of one in the countdown dataset or the NewWorld productID of an item already found then we add it to the merged data
                if (!mergedData[item.barcode]) {
                    mergedData[item.barcode] = 
                        {
                        barcode: item.barcode,
                        CountdownName: null,
                        NewWorldName: item.name,
                        PaknSaveName: null,
                        brand: item.category,
                        
                        unit: item.quanityType,
                        productID: item.productID,
                        countdownProdID: null,
                        prices: {}
                        };
                }
                mergedData[item.barcode].prices[store.storeID] = {
                    price: item.price,
                    nonLoyaltyCardPrice: item.nonLoyaltyCardPrice,
                };
                for (const store of paknsaveDataset) {
                    const matchedItem = store.items.find(item2 => item2.barcode === item.barcode);
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
                    } else if ((item.category === "Fresh Fruit") || (item.category === "PrePacked Fresh Fruit") || (item.category === "Fresh Vegetables")){ // If the barcode does not match and it is a fruit we now search the New World / Paknsave website
                        PakUrl.searchParams.set("storeId",store.storeID);
                        PakUrl.searchParams.set("q",encodeURI(cleanString(item.name)));
                        try {
                            // Delay of 150 ms
                            await new Promise(r => setTimeout(r,150));
                            let response = await axios.request(Pakconfig);
                            let jObj = JSON.parse(JSON.stringify(response.data));
                            let pakScore = 0;
                            let pakMatch = null;
                            
                            let firstProducts = jObj.data.products.slice(0);
                            for (const product of firstProducts) {
                                if ((((product.unitOfMeasure === "g") || (product.unitOfMeasure === "Kg")) && (item1.unit === "Kg")) || ((product.saleType === 'UNITS') && (item1.unit === 'Each'))) {
                                    
                                    const simScore = stringSimilarity.compareTwoStrings(cleanString(product.name),cleanString(item1.name));
                                    if (simScore > pakScore) {
                                        pakScore = simScore;
                                        pakMatch = product
                                    }
                                }
                            }
                            if (pakScore >= 0.6 && !PaknSaveProdIDs.includes(pakMatch.productID)) { //If the match is ~70% accurate then:
                                mergedData[item.barcode].PaknSaveName = pakMatch.name;
                                mergedData[item.barcode].productID = pakMatch.productID;
                                PaknSaveProdIDs.push(pakMatch.productID);
                                
                                mergedData[item.barcode].prices[store.storeID] = {
                                    price: pakMatch.price,
                                    nonLoyaltyCardPrice: pakMatch.nonLoyaltyCardPrice
                                }
                                
                            }
        
        
                            
                                
                            
                        } catch (error) {
                            console.error(`ERROR: ${error}`);
                        }
                    }
        
                };
                
            }
        }
    
    }
    for (const store of paknsaveDataset) {

        for (const item of store.items) {
            let prices = {};

            const countdownMatch = countdownDataset.find(item2 => (item2.barcode === item.barcode)) ;
            if (!prices[store.storeID]) {
                prices[store.storeID] = []; // Initialize prices[store.storeID] as an empty array
            }
            prices[store.storeID].push({
                price: item.price,
                nonLoyaltyCardPrice: item.nonLoyaltyCardPrice
            });
            if (!countdownMatch && !PaknSaveProdIDs.includes(item.productID)) {
                PaknSaveProdIDs.push(item.productID);
                if (!mergedData[item.barcode]) {
                    mergedData[item.barcode] = {};
                }
                mergedData[item.barcode] = {
                    barcode: item.barcode,
                    CountdownName: null,
                    NewWorldName: null,
                    PaknSaveName: item.name,
                    brand: item.category,
                    
                    unit: item.quanityType,
                    productID: item.productID,
                    countdownProdID: null,
                    prices
                    };
            }
        }
    }
    const finalMerge = [];
    for (const barcode in mergedData) {
        finalMerge.push(mergedData[barcode]);
    }
    fs.writeFileSync("./controller/mergedData.json",JSON.stringify(finalMerge,null,2));
}

mergeItems();




