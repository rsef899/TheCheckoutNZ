const express = require('express');
const axios = require('axios');

const app = express();

let pages = "1";
let numItems = "999";
let restrictedItemBoolean = false;
let storeId = "c387ac97-5e0a-43ed-9c93-f1edccda298d";

let id = -1;

async function fetchAllCategories(){

  //set the url to just get categories only store id is needed
  let url = "https://www.newworld.co.nz/next/api/products/search?";
  url += "storeId=" + storeId + "&";

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
async function fetchAllItemsOneCategory(category){

  let url = "https://www.newworld.co.nz/next/api/products/search?";
  url += "category=" + encodeURIComponent(category) + "&";
  url += "storeId=" + storeId + "&";
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
async function fetchAllitems(categories){
  const MAX_RETRIES = 10;
  const REQUEST_DELAY_SEP = 150;

  //results is an array of resolved promises, and must await all promises set within it
  let res = await Promise.all(categories.map(async (cat, index) => {
    // Setup a delay between initial requests
    await new Promise(resolve => setTimeout(resolve, index * REQUEST_DELAY_SEP));

    //retry if request has failed
    let retrySeparation = 1000;
    for(let i = 0; i < MAX_RETRIES; i++) {
      try {
        console.log(`Sending request for items in category ${cat}`)
        //return a promise
        return await fetchAllItemsOneCategory(cat);
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
  return res.flatMap(res => res.data.products.map(normaliseItem));
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
  allData.forEach(function(item, index) {
    let count = 0;
    for (let i = index + 1; i < allData.length; i++) {
      if (item.name === allData[i].name && item.price === allData[i].price) {
        console.log(`items are ${item.name} , id= ${item.id} and ${allData[i].name}, id= ${allData[i].id}`)
        count++;
      }
    }
    if (count > 0) {
      console.log(`Duplicate found: ${item}`);
    }
  });
}

function writeToJson(allDataJSON){

  try{
    //convert data 2 a string, with 2 indenting
    const jsonData = JSON.stringify(allDataJSON, null, 2); // Convert the JSON object to a formatted string

    //import file system module
    const fs = require('fs');

    //write to file
    fs.writeFile('C:/Users/schoo/OneDrive/Desktop/items.json', jsonData, 'utf8', (err) => {
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
  try {
    let allDataJSON = await fetchAllitems(categories);
    let filteredDataJSON = filterItems(allDataJSON);
    writeToJson(filteredDataJSON);
    


  } catch (error){
    console.error(`ERROR: ${error}`)
  }

}

main();