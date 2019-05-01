const API_KEY = '**************';
const MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB;
const request = require('request');

function StocksPriceHandler() {
  
  this.getData = (stock, done) => {
    /* Since Google Finance API is not working anymore, I am using AlphaVantage */
    request('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + stock + '&outputsize=compact&apikey=' + API_KEY, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let result = JSON.parse(body);
        let theDate = new Date();
        let today = theDate.toISOString().slice(0, 10);
        theDate.setDate(theDate.getDate() - 1);
        let yesterday = theDate.toISOString().slice(0, 10);
        let price = 0;
        if (result["Time Series (Daily)"][today] == undefined) {
          price = result["Time Series (Daily)"][yesterday]["4. close"];
        } else {
          price = result["Time Series (Daily)"][today]["4. close"];
        }
        done('stockData', {stock: stock, price: price});
        console.log('Stock: ' + stock + ' ==> ' + 'price: ' + price);
        //done('stockData', {stock: result[0].t ,price: result[0].l});
      } else {
        console.log('issue!');
        done('stockData', 'external source error');
      }
    });
  };
  
  this.loadLikes = (stock, like, ip, done) => {
    MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err, client) => {
      let db = client.db("test");
      let collection = db.collection('stock_likes');
      if(!like) {
        collection.find({stock:stock})
        .toArray((err, doc) => {
          let likes = 0;
          if (doc.length > 0){
            likes = doc[0].likes.length;
          }
          done('likeData', {stock: stock, likes: likes});
        });
      } else {
        collection.findAndModify(
          {stock: stock},
          [],
          {$addToSet: { likes: ip }},
          {new: true, upsert: true},
          (err, doc) => {
            done('likeData',{stock: stock, likes: doc.value.likes.length});
          });
      }
    });
  };
  
}

module.exports = StocksPriceHandler;
