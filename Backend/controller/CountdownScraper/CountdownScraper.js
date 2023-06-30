const express = require('express');
const axios = require('axios');
var fs = require('fs');
const app = express();

const propsToKeep = ["name","barcode","brand","sku","unit","price","images"]
/* Setting initial request settings */

const target = 'browse';
let inStockProductsOnly = 'false';
let size = 120;
let page = 1;


let initUrl = new URL("https://www.countdown.co.nz/api/v1/products");
let url = initUrl;


let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: url,
  headers: { 
    'X-Requested-With': 'OnlineShopping.WebApp', 
    'Cookie': '_abck=0AB975DA4B4FF835BD680D9C18ACA5AE~-1~YAAQ3blY2xnXYgGJAQAACG/TCgqDWiNGKOF2cY+I4PeQN7YohgMlP/YgBLyM7BXKJ/+jC6LaOWIGtG2MzR/eZ93IvIFutLm+QNtpXs4C0DZf0/Yuq4W4LYz1dh3ZG2ZJAcNQUn4fiS2hGFQInkkYp7vF5ugm5q7kJCgzK2pLjFYuGi6XLgaNhx3YLGrsnXbvNphYToqSMtAUgyuP5dMyNv+awuJ+vULpDFA4Ur9UNY8lr7sH4MsTGbbXgBTqbu/XimzawlYZSD+D8foY7fHsNmG9OkpiLy2ULd8C5+GDgp07QtWtkXiXLiXkigBtKDorTb+NABX504KGjRCUL2zglldj5lOT2rfS+BSX5cZ4plDpVi/dsJ1jjCKGCJBAzyNbg5EuTnChs3TV4TC8~-1~-1~-1; ak_bmsc=16C2181BD1D03E180B573E5A9DAB3F89~000000000000000000000000000000~YAAQ3blY2xrXYgGJAQAACG/TChSP5REWvcVbB+SAPNtdbwUhMzkEBZgAgHhwtHGrxHyksrSAB3O99lR0h3tdnLqeZ9bqBXsCSutPNA3o8AHX5qFgDiAuyu8+urnAQSObT5iEeoftwHfivcbBgYEHXvWtJ2tNGpZN6o+N3fqwNmAWV62+dpUOHv9XSK9DM4TfNEcE2URITjLjFKxIIesF9Wkh8pudSJevxSp3tr9y6httreXc4Wya9vGQG93AepBx6mu3SQRWH8E3PphTPbLpD9XXXU52N0JHJy7UDi3DQarGRFXtU5ks66THnMHhLLwzm+2RunGIbwy+OtPaBdF7kLFX+Ku+8kuXjAMBn8yHOhMlHMK6rcXp8XqtFo3lh365TMQ=; bm_sz=E252B3A59ABDFCF976CC1B33CFB58E0C~YAAQ3blY2xvXYgGJAQAACG/TChT5K8M8U9vbXk5BO12YvVMkXlScwx9MB8pHvxpYchBZSIEr0BUNsR/jgLSNKTK3kmsY4BPA9hpm+RzNzVAPxL2uymBxJewqwTYP1j/8IyFEezWd8i0Z0xMseJdWuvF498Zmzh+NKYAAMlFFUvCETZ1VjPD95LDkKOAH/JRM3tDZ3qLBsVMxOGhZP7rBmTlAEPPYixiE7hKb/qZk84m7yUiWWbiNX9ey9YeKAOWBLOreZJh7Dw5yDlYnFFHcXh9H7jG0AZYeDeEQx6XxwdnwVGMnZZHo+g==~4604729~4404280; ASP.NET_SessionId=djccygbts2reansoogqybggn; aga=2c0c8125e3dde5a8ba08d8abc71345d2; agaCORS=2c0c8125e3dde5a8ba08d8abc71345d2; akavpau_vpwww=1688105024~id=14d6edfd7ee8e8385f25f83aad70cc46; cw-arjshtsw=v3bd8f5adcf124a6d9b9a8536c9fc15bbvtqhhplqh; cw-laie=d106d3a7f2a1412c9dee73de55292e59; dtid=2:oRLrBEa/Ve6EKSHvnd6aChrzrOi7oe5VIGVXslBmhI3qExmz+Zi0wMcpnvQf5e+gtKfjTyjXiZSq4Nu4PqBs+LjHpkglzHwBL9jiwHXhmCA3N+iNGDr3dQSgoTGu0jwAtUw='
  }
};
async function getCategories() {
    
let catConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://www.countdown.co.nz/api/v1/products?target=search&search=*',
    headers: { 
      'X-Requested-With': 'XMLHttpRequest', 
      'Cookie': '_abck=0AB975DA4B4FF835BD680D9C18ACA5AE~-1~YAAQ3blY21odPgGJAQAAGnbIBgqN8udkoSRgWSHNU1thfNtRLmI7YUtfVMFC2xd8US5AHV/Scl7mL6QqlbEXXt5EDHtiL26MHsfxVnag1zUD4613+zNzWAq8kY7QL14IMDAxBfgeN6LhLVVv3lCsxwApXd4kF8M06dqGolE80VLoGlq5teB5sZEUdbHifKIfYPvyminVFYYdUwV4W3COThIWnIDXsSScCNelNGlIPwS5ikCuEgP9rMspFwbcEm2tO1SfkB6OmA2HoQlqZTM7Tv/dOjNvLF+UqykDdpB2YJzHZqwmVTQHIX0ORZc1I81kaqfJPNQEGZxBXu0tSS7gLcCniU/mPmEuTfOGNDNYh7YrExG3A76y7hQSfyFB0lpWOXkI4bXVCYXIZR3u~-1~-1~-1; ak_bmsc=C3204C71F904BCC436E94B2A184F2A7B~000000000000000000000000000000~YAAQ3blY21sdPgGJAQAAGnbIBhQ4ZK2ePHWgp50jG8tanNZnAD9HgJkdIkAGk5/L0FBF2S00T0OIIHDP04mmgmDm2yg1RDQFWCMXCuLfxmctVZFGtNF6QRqZWzY6D/qOwLzFzfPYZ59uy9mcZMb+J/c2iGfJkBa+hXZq8y1OVajuRFW/BhExFQqlb+mPfRL1jWW6T8W5aThyiU7/FJWH3/DbZrBVeyX/WQFkHOcbtb6+/TK/TFxyhSPPsMbHIE2RsOyrW+TaxtKn3bxLRrsksGSIdBVW3812cQKzrYjcTR0s52GyZD7M6XFYoVpHRbLrwc/uCWCtK1yn4/b4IIjxioyqQOjEOakE/GhYq2wm1WubEn0vWANW9NyaxtQrQYOX+aw=; bm_sz=31608AEF428A4BBB3F35E409CFDCD657~YAAQ3blY21wdPgGJAQAAGnbIBhS8mHAick4Pdl1uVIQ7UxlCybKd+UtL4K7GVRmXkxaG0nFxUioHU8rM30TJEdQUnJQFaP0qqYn3rQtdJyJG0OELxsI/MtiFljhwpE2MKTzYvT8vQzM24ilzPICm/VKoRd9jWALS6bsQpkC9meyh1pyyVoAc10Z2jxBzKa7L7IONz83v8idfNtZ3K4e3UjG0JOnVKKpWG0ytW6LY/1w49MkLOPP0TIY/p6tMXMQaiKxBcOIt7d9v1yjA/v/eenbJLQ17bpW0I5oRU2aDYbgZDhAlCD7LyA==~3158835~3748161; ASP.NET_SessionId=djccygbts2reansoogqybggn; aga=2c0c8125e3dde5a8ba08d8abc71345d2; agaCORS=2c0c8125e3dde5a8ba08d8abc71345d2; akavpau_vpwww=1688036247~id=7ff5491b1ff32c0cff36407bec915775; cw-arjshtsw=099e925af1bbd4ae3b593a5afe6ac3f98xartgqnoi; cw-laie=d106d3a7f2a1412c9dee73de55292e59; dtid=2:oRLrBEa/Ve6EKSHvnd6aChrzrOi7oe5VIGVXslBmhI3qExmz+Zi0wMcpnvQf5e+gtKfjTyjXiZSq4Nu4PqBs+LjHpkglzHwBL9jiwHXhmCA3N+iNGDr3dQSgoTGu0jwAtUw='
    }
  };

    try {
        let response = await axios.request(catConfig);
        categories = JSON.parse(JSON.stringify(response.data));
        const namesArray = categories.dasFacets.map(item => item.name);
        
        return namesArray;
       
    
    } catch (error) {
        console.error(`ERRORCat: ${error}`)
    }

}

async function getItems(category,page) {

    url.searchParams.set("dasFilter","Department;;"+category+";false");
    url.searchParams.set("target",target);
    url.searchParams.set("inStockProductsOnly",inStockProductsOnly);
    url.searchParams.set("size",size);
    url.searchParams.set("page",page);
    try {
        let response = await axios.request(config)
        // let response = await fetch(url, {
        //     method: 'GET',
        //     headers: { 
        //         'X-Requested-With': 'OnlineShopping.WebApp', 
        //         'Cookie': '_abck=0AB975DA4B4FF835BD680D9C18ACA5AE~-1~YAAQ3blY2xnXYgGJAQAACG/TCgqDWiNGKOF2cY+I4PeQN7YohgMlP/YgBLyM7BXKJ/+jC6LaOWIGtG2MzR/eZ93IvIFutLm+QNtpXs4C0DZf0/Yuq4W4LYz1dh3ZG2ZJAcNQUn4fiS2hGFQInkkYp7vF5ugm5q7kJCgzK2pLjFYuGi6XLgaNhx3YLGrsnXbvNphYToqSMtAUgyuP5dMyNv+awuJ+vULpDFA4Ur9UNY8lr7sH4MsTGbbXgBTqbu/XimzawlYZSD+D8foY7fHsNmG9OkpiLy2ULd8C5+GDgp07QtWtkXiXLiXkigBtKDorTb+NABX504KGjRCUL2zglldj5lOT2rfS+BSX5cZ4plDpVi/dsJ1jjCKGCJBAzyNbg5EuTnChs3TV4TC8~-1~-1~-1; ak_bmsc=16C2181BD1D03E180B573E5A9DAB3F89~000000000000000000000000000000~YAAQ3blY2xrXYgGJAQAACG/TChSP5REWvcVbB+SAPNtdbwUhMzkEBZgAgHhwtHGrxHyksrSAB3O99lR0h3tdnLqeZ9bqBXsCSutPNA3o8AHX5qFgDiAuyu8+urnAQSObT5iEeoftwHfivcbBgYEHXvWtJ2tNGpZN6o+N3fqwNmAWV62+dpUOHv9XSK9DM4TfNEcE2URITjLjFKxIIesF9Wkh8pudSJevxSp3tr9y6httreXc4Wya9vGQG93AepBx6mu3SQRWH8E3PphTPbLpD9XXXU52N0JHJy7UDi3DQarGRFXtU5ks66THnMHhLLwzm+2RunGIbwy+OtPaBdF7kLFX+Ku+8kuXjAMBn8yHOhMlHMK6rcXp8XqtFo3lh365TMQ=; bm_sz=E252B3A59ABDFCF976CC1B33CFB58E0C~YAAQ3blY2xvXYgGJAQAACG/TChT5K8M8U9vbXk5BO12YvVMkXlScwx9MB8pHvxpYchBZSIEr0BUNsR/jgLSNKTK3kmsY4BPA9hpm+RzNzVAPxL2uymBxJewqwTYP1j/8IyFEezWd8i0Z0xMseJdWuvF498Zmzh+NKYAAMlFFUvCETZ1VjPD95LDkKOAH/JRM3tDZ3qLBsVMxOGhZP7rBmTlAEPPYixiE7hKb/qZk84m7yUiWWbiNX9ey9YeKAOWBLOreZJh7Dw5yDlYnFFHcXh9H7jG0AZYeDeEQx6XxwdnwVGMnZZHo+g==~4604729~4404280; ASP.NET_SessionId=djccygbts2reansoogqybggn; aga=2c0c8125e3dde5a8ba08d8abc71345d2; agaCORS=2c0c8125e3dde5a8ba08d8abc71345d2; akavpau_vpwww=1688105024~id=14d6edfd7ee8e8385f25f83aad70cc46; cw-arjshtsw=v3bd8f5adcf124a6d9b9a8536c9fc15bbvtqhhplqh; cw-laie=d106d3a7f2a1412c9dee73de55292e59; dtid=2:oRLrBEa/Ve6EKSHvnd6aChrzrOi7oe5VIGVXslBmhI3qExmz+Zi0wMcpnvQf5e+gtKfjTyjXiZSq4Nu4PqBs+LjHpkglzHwBL9jiwHXhmCA3N+iNGDr3dQSgoTGu0jwAtUw='
        //     }
        
        // });
        jObj = JSON.parse(JSON.stringify(response.data));
        jProducts = jObj["products"];
        totalItems = jProducts["totalItems"];
    
        jProducts = jProducts.items.filter((items)=> items.type === "Product");
        console.log(jProducts);
        return [jProducts.flat(),totalItems];
    //fs.writeFileSync("countdown.json",JSON.stringify(jProducts));
    
    } catch (error) {
        
        console.error(`ERROR: ${error}`)
    }
}
const getPagedItems = async (category, page) => {
    [items,req] = await getItems(category,page);
    return [items,req];

}


async function main() {
    const categories = await getCategories();
    const itemArray = [];
    // Finding all items by category (then by pages in each category)
    
    const categoryPromises = Object.entries(categories).map(async(category) => {
        // Renaming all categories to the name required for requests (& becomes - and removal of capital letters + spaces)

        const categoryItems = [];
        categoryName = category[1];
        console.log(`Checking category: ${categoryName}`);
        categoryName = categoryName.replace(/\s+/g, '');
        categoryName = categoryName.replace("&","-");
        categoryName = categoryName.toLowerCase();

        // Initial (first page) run
        page = 1;
        let flag = true;
        const [initItems,totalReq] = await getItems(categoryName,page);
        totalItems = initItems.length;
        categoryItems.push(initItems);
        
        while ((totalItems <= totalReq) && (flag)) {
            try { // Handle successful result
                page++; 
                let result = await getItems(categoryName,page);
                let items = result[0];
                
                if (items.length != 0) {
                    categoryItems.push(items);
                    totalItems = categoryItems.length;
                    console.log(`Category: ${categoryName} . Total Items currently: ${totalItems} Required: ${totalReq}`);
                       
                } else {
                    flag = false;
                    console.log("EMPTY");
                }
                
                    
            } catch (error) {
                // Handle error
                console.error(error);
            }
            
            
   }
        console.log(`Finished ${categoryName}`);
        return categoryItems;
    });
    const items = await Promise.all(categoryPromises);

    
    
    
    output =  items;

    fs.writeFileSync("countdown.json",JSON.stringify(output));
    

}
main();

// const port = 4000; // Choose a port for your server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
