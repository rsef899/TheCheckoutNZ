
const fs = require('fs');
const countdownDataset = require('./CountdownScraper/countdown.json');
const newWorldDataset = require('./dummy.json');
const mergedData = [];

// Merge items with the same barcode
for (const item1 of countdownDataset) {
//   const matchedStore = newWorldDataset.find(store => store.items.some(item2 => item2.barcode === item1.barcode));
    const matchedItems = [];
    newWorldDataset.forEach(store => {
        const matchedItem = store.items.find(item2 => item2.barcode === item1.barcode);
        if (matchedItem) {
            matchedItems.push({
                storeName: store.storeName,
                storeID: store.storeID,
                productID: matchedItem.productID,
                price: matchedItem.price,
                nonLoyaltyCardPrice: matchedItem.nonLoyaltyCardPrice
            });
        };
        
    });
    if (matchedItems.length === 0) {

        mergedData.push({
            name: item1.name,
            brand: item1.brand,
            barcode: item1.barcode,
            unit: item1.unit,
            countdownObjects: {
                sku: item1.sku,
                price: item1.price,
                size: item1.size
            },
            newWorldObjects: null
        });
    } else {
        mergedData.push({
            name: item1.name,
            brand: item1.brand,
            barcode: item1.barcode,
            unit: item1.unit,
            countdownObjects: {
                sku: item1.sku,
                price: item1.price,
                size: item1.size
            },
            newWorldObjects: matchedItems
        });
    }
}

// Add items from newWorldDataset with unique barcodes -- Not sure if works as expected
for (const store of newWorldDataset) {
    for (const item of store.items) {
        const matchedItem = countdownDataset.find(item2 => item2.barcode === item.barcode);
        if (!matchedItem) {
            mergedData.push({
                name: item.name,
                brand: item.brand,
                barcode: item.barcode,
                unit: item.unit,
                countdownObjects: null,
                newWorldObjects: {
                    storeName: store.storeName,
                    storeID: store.storeID,
                    productID: item.productID,
                    price: item.price,
                    nonLoyaltyCardPrice: item.nonLoyaltyCardPrice
                }
            });
        }
    }
  
}

fs.writeFileSync("./controller/mergedData.json",JSON.stringify(mergedData,null,2));

