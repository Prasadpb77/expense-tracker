const CACHE_NAME = "finance-v1";

const urlsToCache = [

    "/expense-tracker/",
    "/expense-tracker/index.html",
    "/expense-tracker/dashboard.html",
    "/expense-tracker/transactions.html",
    "/expense-tracker/reports.html",
    "/expense-tracker/goals.html",
    
    "/expense-tracker/css/style.css",
    
    "/expense-tracker/js/auth.js",
    "/expense-tracker/js/dashboard.js",
    "/expense-tracker/js/goals.js",
    "/expense-tracker/js/reports.js",
    "/expense-tracker/js/transactions.js"
    
    ];

self.addEventListener(
"install",
event=>{

 event.waitUntil(

 caches.open(CACHE_NAME)
 .then(cache=>{

 return cache.addAll(
 urlsToCache
 );

 })

 );

});

self.addEventListener(
"fetch",
event=>{

 event.respondWith(

 caches.match(
 event.request
 )

 .then(response=>{

 return response ||
 fetch(event.request);

 })

 );

});