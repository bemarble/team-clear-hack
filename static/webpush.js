/**
 * npm web-push パッケージ サイトを参考
 *    https://www.npmjs.com/package/web-push
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * ArrayBuffer型のパラメータをUint8Array型に変換し
 * Base64 URLエンコードによって文字列に変換した値を返す
 *    参考: http://qiita.com/tomoyukilabs/items/217915676603fda73b0a
 */
function arrayBufferToBase64URL(arrayBuffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer))).replace(/\+/g, '-').replace(/\//g, '_');
}


/**
 * serviceWorkerからSubscriptionを取得する
 */
async function getsubscription() {
  var reg = await navigator.serviceWorker.ready;
  var sub = await reg.pushManager.getSubscription();
  return sub;
}
/**
 * Subscriptionを取得するためにサーバ側で生成された
 * WebPush送信のための公開鍵をAPI経由で取得する
 */
async function getPublicKey() {
  var res = await fetch('getpush', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                  }).then((res) => res.json());
  console.log('APIのレスポンス');
  console.log(res.publicKey);
  return res.publicKey;
}
/**
 * サーバから取得した公開鍵を元に
 * ServiceWorkerからSubscriptionを取得する
 */
async function subscribe(option) {
  var reg = await navigator.serviceWorker.ready;
  var sub = await reg.pushManager.subscribe(option);
  return sub;
}
/**
 * サーバから公開鍵を取得し、
 * ServiceWorkerからSubscriptionを取得する
 */
async function initSubscribe() {
  var vapidPublicKey = await getPublicKey();
  let option = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  }
  return await subscribe(option);
}

/**
 * ページの読み込みが完了すれば、
 * WebPushを受け取るための準備を行う
 */
window.addEventListener('load', async () => {
  navigator.serviceWorker.register('./serviceworker.js');
  var sub = await getsubscription();
  if (!sub) {
    // ブラウザに通知許可を要求する
    var permission = await Notification.requestPermission();
    if (permission === 'granted') {
      /*
      navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification('受信の設定をしました', {
          body: '受信の設定をしました',
          icon: 'https://lh4.googleusercontent.com/1HPkuhh4wU-DSBWKmSjLQyFWdmGLo-6mhyk86WR1p22jTzKCgweDsIqa4T7-aiotCiakM1L3fwtd4FUOTaQ-9e_2KoFB8W20tpij=w2584-h1380',
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
      });
      */
    }
    if (permission === 'denied') {
      return alert('ブラウザの通知設定をONにしてください');
    } else {
      sub = await initSubscribe();
    }
  }

  // DOMにsubscribeした内容をセットする
  console.log(sub);
  document.getElementById('js-input-endpoint').value = sub.endpoint;
  document.getElementById('js-input-auth').value     = arrayBufferToBase64URL(sub.getKey('auth'));
  document.getElementById('js-input-p256dh').value   = arrayBufferToBase64URL(sub.getKey('p256dh'));

  document.getElementById('js-btn-unsubscribe').addEventListener('click', async (e) => {
    var sub = await getsubscription();
    if (sub) {
      sub.unsubscribe();
      alert('通知設定を解除しました');
    }
    e.target.disabled = true
    location.reload();
  });
});
