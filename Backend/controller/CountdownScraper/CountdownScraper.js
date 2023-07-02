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
    'X-Requested-With': 'XMLHttpRequest', 
    'Cookie': '_abck=0AB975DA4B4FF835BD680D9C18ACA5AE~-1~YAAQ3blY2xnXYgGJAQAACG/TCgqDWiNGKOF2cY+I4PeQN7YohgMlP/YgBLyM7BXKJ/+jC6LaOWIGtG2MzR/eZ93IvIFutLm+QNtpXs4C0DZf0/Yuq4W4LYz1dh3ZG2ZJAcNQUn4fiS2hGFQInkkYp7vF5ugm5q7kJCgzK2pLjFYuGi6XLgaNhx3YLGrsnXbvNphYToqSMtAUgyuP5dMyNv+awuJ+vULpDFA4Ur9UNY8lr7sH4MsTGbbXgBTqbu/XimzawlYZSD+D8foY7fHsNmG9OkpiLy2ULd8C5+GDgp07QtWtkXiXLiXkigBtKDorTb+NABX504KGjRCUL2zglldj5lOT2rfS+BSX5cZ4plDpVi/dsJ1jjCKGCJBAzyNbg5EuTnChs3TV4TC8~-1~-1~-1; ak_bmsc=8D18B256EF138BC38636F47626F8F039~000000000000000000000000000000~YAAQ3blY29TgagGJAQAA6N1lCxSQgK8f9XqQFLH+nPPaYuhj5q5UCO8tZDuZBp9EwvFI8gMajYdZIxNkzapfT6hROWZ4YCTK0rz6n6D+8N8i4ETV5/98i/tpnN6VlLzKzmBKQRMq3Hs8x4IpPPAbb9aGh9wtK3XmWcwa57QnIaOu0cBEvZq0sYw5hl9SdYDSTVRFqV8CBlrFVtz9wdHa3kbyX/Q6F/2FZu0T+sDV+HGH8TL7Y2EAs+UPzSoaAEUWxbcyJUY07C7ZMc9uiipHEza29hHhMYjeu3eq5aqjarJ/n4xyMZpXOrkmlQUlfcx3WTGlTvKFE9Eu47qBCXEw/R3Wzx0FKQrugASXsJgaKXRUSFfOc0ZCiE6rzY0F8qwNbyk=; bm_sz=E252B3A59ABDFCF976CC1B33CFB58E0C~YAAQ3blY2xvXYgGJAQAACG/TChT5K8M8U9vbXk5BO12YvVMkXlScwx9MB8pHvxpYchBZSIEr0BUNsR/jgLSNKTK3kmsY4BPA9hpm+RzNzVAPxL2uymBxJewqwTYP1j/8IyFEezWd8i0Z0xMseJdWuvF498Zmzh+NKYAAMlFFUvCETZ1VjPD95LDkKOAH/JRM3tDZ3qLBsVMxOGhZP7rBmTlAEPPYixiE7hKb/qZk84m7yUiWWbiNX9ey9YeKAOWBLOreZJh7Dw5yDlYnFFHcXh9H7jG0AZYeDeEQx6XxwdnwVGMnZZHo+g==~4604729~4404280; ASP.NET_SessionId=djccygbts2reansoogqybggn; aga=2c0c8125e3dde5a8ba08d8abc71345d2; agaCORS=2c0c8125e3dde5a8ba08d8abc71345d2; akavpau_vpwww=1688113804~id=69bcb3a26764edec7ffbdcd2dfae9754; cw-arjshtsw=v3bd8f5adcf124a6d9b9a8536c9fc15bbvtqhhplqh; cw-laie=d106d3a7f2a1412c9dee73de55292e59; dtid=2:oRLrBEa/Ve6EKSHvnd6aChrzrOi7oe5VIGVXslBmhI3qExmz+Zi0wMcpnvQf5e+gtKfjTyjXiZSq4Nu4PqBs+LjHpkglzHwBL9jiwHXhmCA3N+iNGDr3dQSgoTGu0jwAtUw='
  }
};
async function getCategories() {
    
let catConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://www.countdown.co.nz/api/v1/products?target=search&search=*',
    headers: { 
      'X-Requested-With': 'XMLHttpRequest', 
      'Cookie': '_abck=0AB975DA4B4FF835BD680D9C18ACA5AE~-1~YAAQ3blY2xnXYgGJAQAACG/TCgqDWiNGKOF2cY+I4PeQN7YohgMlP/YgBLyM7BXKJ/+jC6LaOWIGtG2MzR/eZ93IvIFutLm+QNtpXs4C0DZf0/Yuq4W4LYz1dh3ZG2ZJAcNQUn4fiS2hGFQInkkYp7vF5ugm5q7kJCgzK2pLjFYuGi6XLgaNhx3YLGrsnXbvNphYToqSMtAUgyuP5dMyNv+awuJ+vULpDFA4Ur9UNY8lr7sH4MsTGbbXgBTqbu/XimzawlYZSD+D8foY7fHsNmG9OkpiLy2ULd8C5+GDgp07QtWtkXiXLiXkigBtKDorTb+NABX504KGjRCUL2zglldj5lOT2rfS+BSX5cZ4plDpVi/dsJ1jjCKGCJBAzyNbg5EuTnChs3TV4TC8~-1~-1~-1; ak_bmsc=8D18B256EF138BC38636F47626F8F039~000000000000000000000000000000~YAAQ3blY29TgagGJAQAA6N1lCxSQgK8f9XqQFLH+nPPaYuhj5q5UCO8tZDuZBp9EwvFI8gMajYdZIxNkzapfT6hROWZ4YCTK0rz6n6D+8N8i4ETV5/98i/tpnN6VlLzKzmBKQRMq3Hs8x4IpPPAbb9aGh9wtK3XmWcwa57QnIaOu0cBEvZq0sYw5hl9SdYDSTVRFqV8CBlrFVtz9wdHa3kbyX/Q6F/2FZu0T+sDV+HGH8TL7Y2EAs+UPzSoaAEUWxbcyJUY07C7ZMc9uiipHEza29hHhMYjeu3eq5aqjarJ/n4xyMZpXOrkmlQUlfcx3WTGlTvKFE9Eu47qBCXEw/R3Wzx0FKQrugASXsJgaKXRUSFfOc0ZCiE6rzY0F8qwNbyk=; bm_sz=E252B3A59ABDFCF976CC1B33CFB58E0C~YAAQ3blY2xvXYgGJAQAACG/TChT5K8M8U9vbXk5BO12YvVMkXlScwx9MB8pHvxpYchBZSIEr0BUNsR/jgLSNKTK3kmsY4BPA9hpm+RzNzVAPxL2uymBxJewqwTYP1j/8IyFEezWd8i0Z0xMseJdWuvF498Zmzh+NKYAAMlFFUvCETZ1VjPD95LDkKOAH/JRM3tDZ3qLBsVMxOGhZP7rBmTlAEPPYixiE7hKb/qZk84m7yUiWWbiNX9ey9YeKAOWBLOreZJh7Dw5yDlYnFFHcXh9H7jG0AZYeDeEQx6XxwdnwVGMnZZHo+g==~4604729~4404280; ASP.NET_SessionId=djccygbts2reansoogqybggn; aga=2c0c8125e3dde5a8ba08d8abc71345d2; agaCORS=2c0c8125e3dde5a8ba08d8abc71345d2; akavpau_vpwww=1688113672~id=69f4dc8f2bca768757528e47504d6d7d; cw-arjshtsw=v3bd8f5adcf124a6d9b9a8536c9fc15bbvtqhhplqh; cw-laie=d106d3a7f2a1412c9dee73de55292e59; dtid=2:oRLrBEa/Ve6EKSHvnd6aChrzrOi7oe5VIGVXslBmhI3qExmz+Zi0wMcpnvQf5e+gtKfjTyjXiZSq4Nu4PqBs+LjHpkglzHwBL9jiwHXhmCA3N+iNGDr3dQSgoTGu0jwAtUw='
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
        // Delay of 150 ms
        await new Promise(r => setTimeout(r,150));
        let response = await axios.request(config)

        jObj = JSON.parse(JSON.stringify(response.data));
        jProducts = jObj["products"];
        totalItems = jProducts["totalItems"];
    
        jProducts = jProducts.items.filter((items)=> items.type === "Product");
        console.log(jProducts.length);
        return [jProducts.flat(),totalItems];
   
    
    } catch (error) {
        console.error(`ERROR: ${error}`)
    }
}


async function main() {
    const categories = await getCategories();
    let listItems = [];
    // Finding all items by category (then by pages in each category)
    //const items = await Promise.all(
        for (category of categories) {
        const categoryItems = [];
        categoryName = category;
        // Renaming all categories to the name required for requests (& becomes - and removal of capital letters + spaces)
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
                    totalItems = categoryItems.flat().length;
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
        listItems.push(categoryItems.flat());

    }

    console.log("Main complete");
    let itemSet = new Set(listItems.flat());
    fs.writeFileSync("countdown.json",JSON.stringify(Array.from(itemSet)));

}
main();

// const port = 4000; // Choose a port for your server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
