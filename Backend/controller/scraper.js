const express = require('express');
const axios = require('axios');

const app = express();

app.get('/make-request', async (req, res) => {
    try {
      const response = await axios.post("https://6q1kn3c1gb-dsn.algolia.net/1/indexes/prod-online-pns-products-index-popularity-asc/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.13.1)%3B%20Browser", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded",
          "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-algolia-api-key": "24b2ec4024a407ce0e39419e9bc8fd38",
          "x-algolia-application-id": "6Q1KN3C1GB",
          "Referer": "https://www.paknsave.co.nz/",
          "Referrer-Policy": "origin-when-cross-origin"
        },
        "data": "{\"query\":\"eggs\",\"facets\":[\"category2NI\",\"brand\",\"onPromotion\",\"marketinginitiatives\"],\"attributesToHighlight\":[],\"sortFacetValuesBy\":\"alpha\",\"maxValuesPerFacet\":1000,\"hitsPerPage\":5,\"page\":0,\"facetFilters\":[\"stores:e1925ea7-01bc-4358-ae7c-c6502da5ab12\",\"tobacco:false\"]}"
      });
  
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  const port = 3000; // Choose a port for your server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});