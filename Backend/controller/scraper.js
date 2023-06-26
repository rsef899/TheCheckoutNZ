const express = require('express');
const axios = require('axios');

const app = express();

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://www.newworld.co.nz/next/api/products/search?q=choclate&s=popularity&storeId=c387ac97-5e0a-43ed-9c93-f1edccda298d&publish=true&ps=10663',
    headers: { 
      'Cookie': '__cf_bm=IBijlAExfpq542.s8yvTd74lh2oDcfG74zxpK5oW.uQ-1687786078-0-Aak0i/WkukRgVuEQvNFQ/GxhfiCDa7JrtP0aoO5DcYRRrNr9RuWBMv6KgUdhFqY9x5xCFYllEZLcaMfisV/79Oj2kQLmIwuNp+2YsG20zfRE'
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