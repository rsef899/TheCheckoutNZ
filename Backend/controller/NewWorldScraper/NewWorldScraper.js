const express = require('express');
const axios = require('axios');

const app = express();

let category = "Soft Drinks";
let pages = "1";
let numItems = "999";
let restrictedItemBoolean = false;
let storeId = "c387ac97-5e0a-43ed-9c93-f1edccda298d";


let url = "https://www.newworld.co.nz/next/api/products/search?";
url += "category=" + category + "&";
url += "storeId=" + storeId + "&";
url += "ps=" + numItems + "&";
url += "pg=" + pages + "&";
url += "reg=" + restrictedItemBoolean;

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: url,
  headers: { 
    'Cookie': '__cf_bm=mSagMqawJXFKGXyGlx3F.PjlC8JQXz.leHE1tODhuGM-1687867900-0-AYsGTN7Y0dvsC1RuU3cBYA79kKdgWyoz6+f6sOvtXQwq1LfNM+6vZpvUI1a+ZaiyoL25uJhHBp3b5HSu0SkUw6T8ZmnfVopd/yu+ep3F4W7L'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
  


  const port = 3000; // Choose a port for your server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});