importScripts("https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBBbv3y6P3SkITm897vkLgzArBxe52uqYw",
  authDomain: "bursdagsdager.firebaseapp.com",
  projectId: "bursdagsdager",
  storageBucket: "bursdagsdager.firebasestorage.app",
  messagingSenderId: "343294091630",
  appId: "1:343294091630:web:ed74b431bbfdb52061a17f"
});

const messaging = firebase.messaging();
const CACHE="bursdagsoversikt-v2.1";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg"];

self.addEventListener("install",e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{
      const c=r.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return r;
    }).catch(()=>caches.match(e.request)));
  }
});

messaging.onBackgroundMessage(payload=>{
  const title = payload.data?.title || "Bursdagsoversikt";
  const body = payload.data?.body || "En elev har bursdag i dag.";
  self.registration.showNotification(title,{
    body,
    icon:"./icon.svg",
    badge:"./icon.svg",
    tag: payload.data?.tag || "bursdag-i-dag",
    data:{url:"./"}
  });
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if("focus" in client) return client.focus();
    }
    return clients.openWindow("./");
  }));
});
