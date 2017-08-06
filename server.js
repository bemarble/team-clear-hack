'use strict';

// Express フレームワークの呼び出し
var express = require('express');
var app = express();
app.set('view engine', 'ejs');
const url = require('url');
// WebPush用のライブラリ
var webpush = require('web-push');
var db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Connection URL
var db_url = 'mongodb://localhost:27017/miratan';

// Use connect method to connect to the Server
MongoClient.connect(db_url, function(err, mongodb) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  db = mongodb;
});

var collection = function(name) {
  return db.collection(name);
}

module.exports = collection;



// POSTでリクエストパラメータを取得する際に利用する
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));

app.listen('3000', () => {});


const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);


app.get('/getpush', (req, res) => {
  return res.json({
    publicKey: vapidKeys.publicKey
  });
});

app.get('/list', (req, res) => {

});

app.get('/sample', (req, res) => {
  collection = db.collection("notification");

  // コレクションにドキュメントを挿入
  collection.find({endpoint: "ahttps://fcm.googleapis.com/fcm/send/cZ-bJ4upBUQ:APA91bHKoelumV0ppjGRQ2yRqqDNrOPgmMKupqd3psuUw3Y2zsK1i39Q-4Qe1ZOgZLzshFQ76YIfugaMc-aJj2GB8waXmRRils6SB8nJ3IgLmT-pnOZFonXqlP02XuWBab1_8_mhMNZZ"}).toArray((error, documents)=>{
    console.log(documents.length);
    if (documents.length == 0) {

    }
    for (var document of documents) {
        console.log(document);
    }
  });

  return res.json({
    publicKey: 'test'
  });
})
app.post('/send/webpush', (req, res) => {
  var pushSubscription = {
      endpoint: req.body.endpoint,
      keys: {
        p256dh: req.body.p256dh,
        auth: req.body.auth
      }
  };

  var result = {};
  var link = 'http://maps.google.com/maps?q='+ req.body.lat +',' + req.body.lng;
  var obj = {
    title: 'ミラタンからのお知らせ！',
    body: '蜃気楼出たよー！',
    icon: 'https://lh4.googleusercontent.com/1HPkuhh4wU-DSBWKmSjLQyFWdmGLo-6mhyk86WR1p22jTzKCgweDsIqa4T7-aiotCiakM1L3fwtd4FUOTaQ-9e_2KoFB8W20tpij=w2584-h1380',
    link: link
  }
  var message = JSON.stringify(obj);


  collection = db.collection("notification");

  console.log(pushSubscription);
  console.log(message);
  result.req = req.body;
  result.url = link

  // コレクションにドキュメントを挿入
  var notifications = collection.find({endpoint: pushSubscription.endpoint});

  console.log("aaaaa");
  if (notifications) {
    console.log("bbbbb");

    notifications.toArray((error, documents)=>{
      console.log("ccccc", documents);

      if (documents == undefined || documents.length == 0) {
        // コレクションにドキュメントを挿入
        var insert_params = {
          vapidKeys: vapidKeys,
          endpoint: req.body.endpoint,
          keys: {
            p256dh: req.body.p256dh,
            auth: req.body.auth
          }
        }

        if (req.body.endpoint != "") {
          collection.insertOne(insert_params, (error, result) => {
            console.log("insert!!")
            //db.close();
          });
        } else {
          res.json({
            "error": "param error"
          })
        }

      }
    });
  }

  collection = db.collection("notification");

  // 全件取得
  collection.find().toArray((error, documents)=>{
    console.log(documents);
    if (documents !== undefined) {
      for (var document of documents) {
          var pushSubscriptionParam = {
            endpoint: document.endpoint,
            keys: {
              p256dh: document.p256dh,
              auth: document.auth
            }
          };

          var tmp_vapidKeys = document.vapidKeys;

          if (pushSubscriptionParam.keys.p256dh === undefined) {
            pushSubscriptionParam.keys.p256dh = req.body.p256dh;
            pushSubscriptionParam.keys.auth = req.body.auth;
          }
          console.log("tmp_vapidKeys", tmp_vapidKeys);
          var options = {
            TTL: 10000,
            vapidDetails: {
              subject: obj.link,
              publicKey: tmp_vapidKeys.publicKey,
              privateKey: tmp_vapidKeys.privateKey
            }
          }

          console.log("bbbbb", pushSubscriptionParam, pushSubscription);
          webpush.sendNotification(pushSubscription, message, options).then((response)=>{
            console.log("success:", response);
          }).catch((error) => {
            collection.remove({'_id': document['_id']})

            console.log("error", error);
          });
      }
    }


  });


  res.render('push', {result: result});

});
