const axios = require('axios');

let pages = "1";
let numItems = "999";
let restrictedItemBoolean = false;
let initialStoreId = "c387ac97-5e0a-43ed-9c93-f1edccda298d";

let timeSinceLastCall = 0;

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
  
  
  let itemsAllStores = [];


  for(const store of stores) {
    for(cat of categories) {
      let i;
      for(i = 0; i < 5; i++) {
        console.log(`Sending request for items in category ${cat}, try (${i+1}/${5})`)
        
        try {
          itemsAllStores.push(await fetchAllItemsOneCategory(cat, store.id));
          break;
        } catch(err) {
          console.warn(`Failed to fetch items for category ${cat}: ${err}, retrying (attempt)`)
        }
      }

      if(i == 5) {
        throw new Error("Failed 5/5 requests");
      }
    }
  }


        
        
  
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