/* ══════════════════════════════════════════════════════════════════════
   SW — este archivo ya NO guarda nada. Se desinstala solo.

   POR QUE SE SACO
   ---------------
   Antes esto guardaba el portal entero para que funcionara sin internet.
   Sonaba bien y trajo mas problemas de los que resolvia:

   1. En iPhone rompia el portal. Safari rechaza cualquier respuesta que
      un service worker devuelva si vino de una redireccion, y la pagina
      directamente no abria.
   2. Obligaba a subir un numero de version en cada cambio. Si uno se
      olvidaba, el navegador seguia mostrando la copia vieja y uno juraba
      que el cambio no se habia aplicado.
   3. Escondia los errores: en Chrome andaba, en Safari no, y no habia
      forma de darse cuenta hasta que otra persona lo abria en su celular.

   El portal se usa con internet. Sin guardar nada anda igual de rapido,
   se ve siempre la ultima version, y no hay nada que recordar.

   QUE HACE AHORA
   --------------
   Se desinstala a si mismo y borra todo lo que habia guardado. Eso
   arregla los celulares que quedaron trabados con la version vieja: al
   entrar de nuevo bajan este archivo, se limpia solo, y el portal vuelve
   a andar. No hay que borrar datos a mano.

   Este archivo se puede eliminar del proyecto dentro de unos meses,
   cuando ya no queden celulares con la version vieja instalada.

   SI ALGUN DIA HACE FALTA QUE FUNCIONE SIN INTERNET
   -------------------------------------------------
   Se vuelve a escribir, pero con dos reglas que antes no estaban:
   las navegaciones NUNCA pasan por aca (van derecho a la red), y solo
   se guardan los estilos y las imagenes.
   ══════════════════════════════════════════════════════════════════════ */

self.addEventListener('install', function(){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(claves){ return Promise.all(claves.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll({type:'window'}); })
      .then(function(ventanas){ ventanas.forEach(function(v){ v.navigate(v.url); }); })
  );
});

/* Sin fetch: todo va derecho a la red. Es la linea que faltaba. */
