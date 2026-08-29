/* ══════════════════════════════════════════════════════════════════════
   SW — el que hace que el portal ande sin internet

   El estudio suele tener mala señal (subsuelo, gimnasio, vestuario).
   Sin esto, el kinesiólogo abre la app en el medio de una sesión y ve
   una pantalla en blanco.

   Estrategia: las pantallas y estilos se guardan al instalar y se sirven
   desde el teléfono. Firebase maneja sus propios datos aparte y ya sabe
   trabajar sin conexión.

   IMPORTANTE: cada vez que se toca una pantalla hay que subir el número
   de VERSION. Si no, el navegador sigue mostrando la copia vieja y vas a
   volverte loco preguntándote por qué no se ve el cambio.
   ══════════════════════════════════════════════════════════════════════ */

var VERSION = 'estudio-v16';

var ARCHIVOS = [
  'index.html',
  'panel.html',
  'agenda.html',
  'lesiones.html',
  'pizarron.html',
  'ejercicios.html',
  'mi.html',
  'diario.html',
  'pacientes.html',
  'alta.html',
  'css/tema.css',
  'css/estudio.css',
  'js/datos.js',
  'js/base.js',
  'js/ayuda.js',
  'manifest.json',
  'img/icono-192.png',
  'img/icono-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VERSION)
      .then(function(c){ return c.addAll(ARCHIVOS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

/* Al activar una versión nueva se borran las viejas, para que no queden
   dos copias del portal peleándose. */
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(claves){
      return Promise.all(claves.map(function(k){
        if(k !== VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;

  /* Firebase y las tipografías se piden siempre a la red: los datos
     tienen que estar frescos y Firebase ya guarda lo suyo. */
  if(url.indexOf('firebaseio') > -1 || url.indexOf('googleapis') > -1
     || url.indexOf('gstatic') > -1 || e.request.method !== 'GET'){
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(guardado){
      if(guardado) return guardado;
      return fetch(e.request).catch(function(){
        return caches.match('index.html');
      });
    })
  );
});

/* huella: 6b1338347e1d */
