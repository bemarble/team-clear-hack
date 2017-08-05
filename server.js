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

  var obj = {
    title: 'ミラタンからのお知らせ！',
    body: '蜃気楼出たよー！見に来てね！！ 座標:' + req.body['lat-lng'],
    icon: 'https://lh4.googleusercontent.com/1HPkuhh4wU-DSBWKmSjLQyFWdmGLo-6mhyk86WR1p22jTzKCgweDsIqa4T7-aiotCiakM1L3fwtd4FUOTaQ-9e_2KoFB8W20tpij=w2584-h1380',
    link: 'http://www.city.uozu.toyama.jp/guide/svGuideDtl.aspx?servno=4192'
  }
  var message = JSON.stringify(obj);

  var options = {
    TTL: 10000,
    vapidDetails: {
      subject: obj.link,
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
