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
    id: ++id,
    productID: item.productId,
    brand: item.brand,
    name: item.name,
    category: item.category,
    price: item.price,
    nonLoyaltyCardPrice: item.nonLoyaltyCardPrice,
    quanityType: item.displayName
  };
  
  return product;
}

async function main(){
  let categoryfetchData = await fetchAllCategories();
  let categories = getCategories(categoryfetchData);
  try {
    let allDataJSON = await fetchAllitems(categories);
    console.log(allDataJSON);
  } catch (error){
    console.error(`ERROR: ${error}`)
  }

}

main();