const axios = require('axios');

let pages = "1";
let numItems = "999";
let restrictedItemBoolean = false;
let initialStoreId = "c387ac97-5e0a-43ed-9c93-f1edccda298d";

async function fetchAllStores(){
  let url = "https://www.newworld.co.nz/CommonApi/Store/GetStoreList";

  let allStoresConfig = {
    method: 'get',
    maxBodyLength: 1024 * 1024 * 512, // Limit to 512MB
    url: url
  };

  try {
    let response = await axios.request(allStoresConfig);
    let data = response.data;
    return data;
  } catch (error){
    console.error(`ERROR: ${error}`);
    throw error;
  }

}

function getAllStores(storeData){
  let stores = [];
  storeData.stores.forEach(function(store, index){
    stores[index] = {
      name: store.name,
      id: store.id,
      address: store.address,
      latitude: store.latitude,
      longitude: store.longitude
    }
  });
  return stores;
}

async function fetchAllCategories(){

  //set the url to just get categories only store id is needed
  let url = "https://www.newworld.co.nz/next/api/products/search?";
  url += "storeId=" + initialStoreId + "&";

  let allCategoriesConfig = {
    method: 'get',
    maxBodyLength: 1024 * 1024 * 512, // Limit to 512MB
    url: url
  };

  try {
    let response = await axios.request(allCategoriesConfig);
    let data = response.data;
    return data;
  } catch (error){
    console.error(`ERROR: ${error}`);
    throw error;
  }

}

function getCategories(categoriesData){
  try{
    let categories = Object.keys(categoriesData.data.facets.categories);
    return categories;
  } catch (error){
    console.error(`ERROR: ${error}`)
  }
}
/**
 * 
 * @param {String} category 
 * @returns {Object}
 */
async function fetchAllItemsOneCategory(category, store){

  let url = "https://www.newworld.co.nz/next/api/products/search?";
  url += "category=" + encodeURIComponent(category) + "&";
  url += "storeId=" + store + "&";
  url += "ps=" + numItems + "&";
  url += "pg=" + pages + "&";
  url += "reg=" + restrictedItemBoolean;


  let allItemsConfig = {
    method: 'get',
    maxBodyLength: 1024 * 1024 * 512,
    url: url,
  };

  let response = await axios.request(allItemsConfig);
  let data = response.data;
  data.data.products.forEach(function(product){
    product.category = category;
  });
  return data;
}

/**
 * @param {Array<String>} categories 
 */
async function fetchAllitems(categories, stores){
  
  const MAX_RETRIES = 10;
  const REQUEST_DELAY_SEP = 300;
  let itemsAllStores = [];


  await Promise.all(
    stores.map(async (store) =>{

      let res = await Promise.all(categories.map(async (cat, index) => {
        // Setup a delay between initial requests

        await new Promise(resolve => setTimeout(resolve, index * REQUEST_DELAY_SEP));
        //retry if request has failed
        let retrySeparation = 1000;
        for(let i = 0; i < MAX_RETRIES; i++) {
          try {
            console.log(`Sending request for items in category ${cat}`)
            //return a promise
            return await fetchAllItemsOneCategory(cat, store.id);
          } catch {
            console.warn(`Failed to fetch items for category ${cat}, retrying (attempt ${i + 2}/${MAX_RETRIES})`)
          }
          //Set timer for re-request if request failed, promise wait for promise to be resolved
          await new Promise(resolve => setTimeout(resolve, retrySeparation));
          //increase retry time
          retrySeparation *= 2;
        }
      }));
      //combine all products from all category searches into one array
      //flat combines all into one array
      let productsOneCategory = filterItems(res.flatMap(res => res.data.products.map(normaliseItem)));
      let oneStoreData = {
        storeName: store.name,
        storeId: store.id,
        storeLatitude: store.latitude,
        storeLongitude: store.longitude,
        items: productsOneCategory
      }
      itemsAllStores.push(oneStoreData)

      
    }));
    return itemsAllStores;
    

  //results is an array of resolved promises, and must await all promises set within it

}

function normaliseItem(item){
  let product = {
    productID: item.productId,
    brand: item.brand,
    category: item.category,
    name: item.name,
    price: item.price,
    nonLoyaltyCardPrice: item.nonLoyaltyCardPrice,
    quanityType: item.displayName
  };
  
  return product;
}

function filterItems(allProducts){
  // reduce allows us to change the strucuture based on the array, in this case accumulating a new map
  // the accumulator is just a map
  // making use of the fact a map can only have unique keys, so every repeated product ID, only one version will be stored
  //.values() does not return teh value, it returns an iterator containing the values
  //to return teh value we use the ... oeprator to get the values inside the itterator
  const noDuplicates = [...allProducts.reduce((map,item) => map.set(item.productID, item),new Map()).values()];
  return noDuplicates;

}

function checkForDupes(allData) {
  for (const store of allData){

    store.items.forEach(function(item, index) {
      let count = 0;
      for (let i = index + 1; i < allData.length; i++) {
        if (item.name === store.name && item.price === store.price && item.quanityType === checkingStore.quanityType) {
          console.log(`items are ${item.name} , id= ${item.id} and ${checkingStore[i].name}, id= ${acheckingStore[i].id}`)
          count++;
        }
      }
      if (count > 0) {
        console.log(`Duplicate found: ${item}`);
      }
    });
  }  
}

function writeToJson(allDataJSON, path){

  try{
    //convert data 2 a string, with 2 indenting
    const jsonData = JSON.stringify(allDataJSON, null, 2); // Convert the JSON object to a formatted string

    //import file system module
    const fs = require('fs');

    //write to file
    fs.writeFile(path, jsonData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('JSON file has been written successfully.');
      }
    });

  }catch (error){
    console.error(`ERROR: ${error}`)
  } 
}

async function main(){
  let categoryfetchData = await fetchAllCategories();
  let categories = getCategories(categoryfetchData);
  let storesFetch = await fetchAllStores();
  let stores = getAllStores(storesFetch);
  let someStores = [stores[0], stores[1]];
  console.log(someStores);
  try {
    let allDataJSON = await fetchAllitems(categories, someStores);
    writeToJson(allDataJSON, 'items.json');
 
    console.log(allDataJSON[0].items.length)
    console.log(allDataJSON[1].items.length)

    checkForDupes(allDataJSON)
  } catch (error){
    console.error(`ERROR: ${error}`)
  }

}

main();