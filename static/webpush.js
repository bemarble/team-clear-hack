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

function urlUnit8ArrayToBase64URL(unit) {
  return btoa(String.fromCharCode.apply(null, unit)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

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
    new Notification('WebPushの設定をしました');
    if (permission === 'denied') {
      return alert('ブラウザの通知設定をONにしてください');
    } else {
      sub = await initSubscribe();
    }
  }

  // DOMにsubscribeした内容をセットする
  console.log(sub);
  document.getElementById('js-input-endpoint').value = sub.endpoint;
  document.getElementById('js-input-auth').value     = urlUnit8ArrayToBase64URL(new Uint8Array(sub.getKey('auth')));
  document.getElementById('js-input-p256dh').value   = urlUnit8ArrayToBase64URL(new Uint8Array(sub.getKey('p256dh')));

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


