'use strict';

// Express フレームワークの呼び出し
var express = require('express');
var app = express();

const url = require('url');

// WebPush用のライブラリ
var webpush = require('web-push');

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

app.post('/send/webpush', (req, res) => {

  var pushSubscription = {
      endpoint: req.body.endpoint,
      keys: {
          p256dh: req.body.p256dh,
          auth: req.body.auth
      }
  };
  var message = JSON.stringify({
    title: req.body.title,
    body: req.body.body,
    icon: req.body.icon,
    link: req.body.link,
  });

  var options = {
    TTL: 10000,
    vapidDetails: {
      subject: req.body.link,
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey
    }
  }

  console.log(pushSubscription);
  console.log(message);
  console.log(options);

  webpush.sendNotification(pushSubscription, message, options).then((response)=>{
    return res.json({
      statusCode: response.statusCode || -1,
      message: response.message || '',
    });
  }).catch((error) => {
    console.log(error);
    return res.json({
      statusCode: error.statusCode || -1,
      message: error.message || '',
    });
  });

});



