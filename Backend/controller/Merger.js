const countdownDataset = (require('./CountdownScraper/countdown.json'));
const newWorldDataset = (require('./dummy.json'));


const mergedData = countdownDataset.map(item => {
    //let matchedItem = null;
    // for (const item2 of newWorldDataset) {
    //     if (item2.barcode == item.barcode) {
    //       matchedItem = item2;
    //       break;
    //     }
    //   }
    const matchedItem = newWorldDataset.find(newItem => newItem.barcode == item.barcode);
    return {
        name: item.name,
        brand: item.brand,
        barcode: item.barcode,
        countdownObjects: item,
        newWorldObjects: matchedItem || null

    };

});
// let countdownJSON = JSON.parse(JSON.stringify(countdownDataset));
// const mergedData = countdownJSON.reduce(function(acc, item) {
//     return {...acc, [item.barcode]: item}
// }, {});
console.log(mergedData);
