const MongoObject = require('./dbConnect');

async function getData(){
    const db = await MongoObject.client.db("the_checkout_nz");
    const itemsCollection = await db.collection("items");
    const result = await itemsCollection.insertOne({
         
            "NewWorldName": "Rosy",
            "CountdownName": "Fresh BAnanace",
            "PaknSaveName": "fresh fruit bananas yellow",
            "brand": "fresh fruit",
            "barcode": "9354829000064",
            "Quantity": "kg",
            "packageType": "loose",
            "prices" : {
                "de5595ab-1d28-46c6-9e9a-b1c3db1af827" : {
                    "price": 324,
                    "nonLoyaltyCardPrice": 343
                },
                "de5234ab-1d28-46c6-9e9a-b1c3db1af827" : {
                    "price": 571,
                    "nonLoyaltyCardPrice": 543
                }
        }
        
    });
    console.log(result.insertedId)
    MongoObject.client.close();
}

getData();



