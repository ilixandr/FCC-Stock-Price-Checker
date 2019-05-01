/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
    
    suite('GET /api/stock-prices => stockData object', () => {
      
      test('1 stock', (done) => {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end((err, res) => {
          //complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          done();
        });
      });
      
      let likes;
      let rel_likes;
      
      test('1 stock with like', (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isAbove(res.body.stockData.likes, -1);
          likes = res.body.stockData.likes;
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.likes, likes);
          done();
        });
      });
      
      test('2 stocks', (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'stock');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.oneOf(res.body.stockData[0].stock, ['GOOG','MSFT']);
          assert.oneOf(res.body.stockData[1].stock, ['GOOG','MSFT']);
          assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
          rel_likes = Math.abs(res.body.stockData[0].rel_likes);
          done();
        });
      });
      
      test('2 stocks with like', (done) => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft'], like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'stock');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.oneOf(res.body.stockData[0].stock, ['GOOG','MSFT']);
          assert.oneOf(res.body.stockData[1].stock, ['GOOG','MSFT']);
          assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
          assert.equal(Math.abs(res.body.stockData[0].rel_likes),rel_likes);
          done();
        });
      });
      
    });

});
