const express = require('express');
const axios = require('axios');

const app = express();

let category = "Soft Drinks";
let pages = "1";
let numItems = "999";
let restrictedItemBoolean = false;
let storeId = "c387ac97-5e0a-43ed-9c93-f1edccda298d";






async function fetchAllCategories(){

  //set the url to just get categories only store id is needed
  let url = "https://www.newworld.co.nz/next/api/products/search?";
  url += "storeId=" + storeId + "&";

  let allCategoriesConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Cookie': '__cf_bm=mSagMqawJXFKGXyGlx3F.PjlC8JQXz.leHE1tODhuGM-1687867900-0-AYsGTN7Y0dvsC1RuU3cBYA79kKdgWyoz6+f6sOvtXQwq1LfNM+6vZpvUI1a+ZaiyoL25uJhHBp3b5HSu0SkUw6T8ZmnfVopd/yu+ep3F4W7L'
    }
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
  let categories = [];
  
  try{
    categories = Object.keys(categoriesData.data.facets.categories);
    return categories;
  }catch (error){
    console.error(`ERROR: ${error}`)
  }
}

async function getAllItems(){

  let url = "https://www.newworld.co.nz/next/api/products/search?";
  url += "category=" + category + "&";
  url += "storeId=" + storeId + "&";
  url += "ps=" + numItems + "&";
  url += "pg=" + pages + "&";
  url += "reg=" + restrictedItemBoolean;

  let allItemsConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Cookie': '__cf_bm=mSagMqawJXFKGXyGlx3F.PjlC8JQXz.leHE1tODhuGM-1687867900-0-AYsGTN7Y0dvsC1RuU3cBYA79kKdgWyoz6+f6sOvtXQwq1LfNM+6vZpvUI1a+ZaiyoL25uJhHBp3b5HSu0SkUw6T8ZmnfVopd/yu+ep3F4W7L'
    }
  };

  try {
    let response = await axios.request(allItemsConfig);
    let data = response.data;
    return data;
  } catch (error){
    console.error(`ERROR: ${error}`);
    throw error;
  }
}

async function main(){
  let categoryfetchData = await fetchAllCategories();
  let categories = getCategories(categoryfetchData);
  console.log(categories);
  try {
  let productsArray = [];
  let id = -1;

  let allDataJSON = await getAllItems();
  let productsFromSearch = allDataJSON.data.products;
  productsFromSearch.forEach(function(oneProduct){
    let productToPush = {};
    id++;
    productToPush.id = id;
    productToPush.productID = oneProduct.productId;
    productToPush.brand = oneProduct.brand;
    productToPush.name = oneProduct.name;
    productToPush.price = oneProduct.price;
    productToPush.NonloyaltyCardPrice = oneProduct.nonLoyaltyCardPrice;
    productToPush.quanityType = oneProduct.displayName;

    productsArray.push(productToPush)

  });
  
  
  } catch (error){
    console.error(`ERROR: ${error}`)
  }

}

main();

const port = 3001; // Choose a port for your server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});