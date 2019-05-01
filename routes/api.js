/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');

const StocksPriceHandler = require('../utils/stocksPriceHandler.js');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = (app) => {
  let stockPrices = new StocksPriceHandler();
  app.route('/api/stock-prices')
    .get((req, res) => {
      let stock = req.query.stock;
      let like = req.query.like || false;
      let reqIP = req.connection.remoteAddress;
      let stockData = null;
      let likeData = null;
      let multi = false;
      if (Array.isArray(stock)) {
        multi = true;
        stockData = [];
        likeData = [];
      }    
      const worker = (ret, data) => {
        if (ret == 'stockData') {
          multi ? stockData.push(data) : stockData = data;
        } else {
          multi ? likeData.push(data): likeData = data;
        }
        if (!multi && stockData && likeData !== null) {
          stockData.likes = likeData.likes;
          res.json({stockData});
        } else if (multi && stockData.length == 2 && likeData.length == 2) {
          if (stockData[0].stock == likeData[0].stock) {
            stockData[0].rel_likes = likeData[0].likes - likeData[1].likes;
            stockData[1].rel_likes = likeData[1].likes - likeData[0].likes;
          } else {
            stockData[0].rel_likes = likeData[1].likes - likeData[0].likes;
            stockData[1].rel_likes = likeData[0].likes - likeData[1].likes;
          }
          res.json({stockData});
        }
      }
      if (multi) {
        stockPrices.getData(stock[0], worker);
        stockPrices.loadLikes(stock[0], like, reqIP, worker);
        stockPrices.getData(stock[1], worker);
        stockPrices.loadLikes(stock[1], like, reqIP, worker);
      } else {
        stockPrices.getData(stock, worker);
        stockPrices.loadLikes(stock, like, reqIP, worker);
      }
    });    
};
