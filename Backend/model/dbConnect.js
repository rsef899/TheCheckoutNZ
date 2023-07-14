const dotenv = require('dotenv');
const path = require('path');
const MongoClient = require("mongodb").MongoClient;



//setting the path to the .env file in out specific folder
const envFilePath = path.resolve(__dirname, '.env');
dotenv.config({ path: envFilePath });



class MongoBot {
    constructor() {
      const uri = process.env.MONGODB_URI || '';
      //initialise the MongoDb client
      this.client = new MongoClient(uri, { useUnifiedTopology: true });
    }
    async init() {
      //connect to the database
      await this.client.connect();
      console.log('connected');
      //
      this.db = this.client.db(conf.db);
    }
  }
  
  module.exports = new MongoBot();





