# LO QUE APRENDIMOS

> Escrito después de romper el portal en iPhone y de darnos cuenta de que
> estábamos tardando más que en el proyecto anterior.
>
> No es una lista de buenas intenciones. Cada regla salió de un error concreto
> que costó tiempo, y al lado dice cuál fue.

---

## LOS ERRORES, SIN MAQUILLAR

| Qué pasó | De dónde salió |
|---|---|
| El portal no abría en iPhone | Puse guardado sin internet que nadie pidió |
| Había que subir un número de versión a mano | Lo mismo |
| Ningún botón funcionaba en el archivo de demostración | Segunda implementación paralela |
| Faltaban pantallas en el archivo único | Lista escrita a mano |
| Faltaba un archivo de código en el archivo único | Otra lista escrita a mano |
| El parámetro de la dirección se ignoraba | Otra más |
| Comillas escapadas de menos | Código que genera código |
| Se cayó en Windows por los acentos | Nunca probé en Windows |
| El pizarrón quedó de 18 MB | Busqué un texto que aparecía dos veces |
| El editor descartaba lo que escribías | Releía el estado en cada redibujado |
| La ruta de firebase apuntaba a otro lado | Nadie lo verificaba |
| Una pantalla sin encabezado ni menú | Nadie lo verificaba |
| El auditor avisó 11 veces de mentira | Windows usa `\` y el HTML `/` |
| El menú del celular estaba al final de la página | Lo probé en el archivo único, no en el real |
| Tocar el turno no hacía nada, sin avisar | La agenda de ejemplo no tenía el paciente |
| **Cinco horas publicando sin que cambiara nada** | **Un comentario mío adentro de `vercel.json`** |
| La cuenta correcta era rechazada al entrar | Le pedí el rol a una función que no devuelve datos |

**Diecisiete errores. Cinco salieron del archivo único, cuatro de agregar cosas que
nadie pidió, y dos de no probar en Windows.**

---

## LAS SEIS REGLAS

### 1. Si no resuelve un problema que hay HOY, no va

El guardado sin internet sonaba bien. Nadie lo había pedido. Costó: el portal
roto en iPhone, un número de versión que mantener, y errores que solo aparecían
en el celular de otra persona.

Lo mismo con las URLs limpias de Vercel: las activé por prolijidad y fueron la
causa directa de que la aplicación no abriera.

**Antes de agregar algo, la pregunta es qué problema de esta semana resuelve.**
Si la respuesta es "puede servir más adelante", no va.

### 2. Una sola implementación de cada cosa

El archivo único era una segunda aplicación: reimplementaba la cabecera, el
menú, el enrutador y los parámetros de la dirección. Cinco de los últimos seis
errores salieron de ahí, no de la aplicación de verdad.

Existía para poder mandarlo por WhatsApp cuando no había dirección publicada.
Cuando la hubo, dejó de tener sentido y siguió ahí dos semanas más.

**Cuando algo deja de hacer falta, se borra el mismo día.**

### 3. Ninguna lista escrita a mano

Tres errores distintos, la misma causa: listas de archivos mantenidas a mano que
se desincronizaban. Las pantallas del archivo único. Los archivos de código. Los
archivos que el service worker guardaba.

Cada una se arregló igual: en vez de escribir la lista, leer la carpeta.

**Si algo se puede deducir, se deduce. Una lista a mano es una promesa de
olvidarse.**

### 3b. Los archivos de configuración no aceptan comentarios

Le puse un comentario adentro de `vercel.json` explicando por qué no había que
volver a activar las URLs limpias. Vercel rechaza cualquier propiedad que no
conoce, así que **rechazó todas las publicaciones durante cinco horas** y siguió
mostrando la versión vieja sin avisar.

Fue el error más caro de todos, y el más tonto: un comentario bienintencionado.

**Un error que no se ve es peor que uno que revienta.** `PUBLICAR.bat` decía
"LISTO" cuando lo único listo era la subida a GitHub. Ahora abre la pantalla de
Vercel para que se vea si dice Ready o Error, y el auditor revisa `vercel.json`
antes de dejar publicar.

### 4. Probar donde se usa, no donde se programa

El error de los acentos solo aparece en Windows. El del iPhone solo en Safari.
Ninguno de los dos se veía probando en Chrome sobre Linux.

**Lo que no se probó en el aparato donde se va a usar, no está probado.**

Volvió a pasar: el auditor avisaba once veces de que archivos que sí se usan no
se usaban, porque Windows escribe las rutas con barra invertida y el HTML con
barra normal. En mi máquina no se veía. Un auditor que avisa de más deja de
leerse, que es peor que no tener auditor.
Por eso conviene que cada cosa nueva la abra él en el iPhone antes de darla por
buena: es el navegador más estricto y encuentra los errores primero.

### 5. Tocar los botones, no llamar las funciones

Durante semanas probé llamando funciones desde la consola. Todo daba bien. El
día que hice clic de verdad descubrí que **ningún botón funcionaba** en el
archivo de demostración: las funciones existían pero el navegador no las
encontraba.

**Una prueba que no toca un botón no prueba nada.**

Volvió a pasar dos veces más. El menú del celular lo probé en el archivo único
—que después borré—, nunca en los archivos de verdad: estaba al final de la
página y había que bajar hasta el fondo. Y tocar un turno para atender no hacía
absolutamente nada, sin ningún aviso, porque los turnos de ejemplo se habían
escrito antes de que existiera el padrón. Las dos cosas aparecieron el mismo día,
tocando la aplicación en un iPhone simulado.

**Fallar en silencio es la peor forma de fallar.** Si algo no puede seguir, tiene
que decirlo.

### 6. Antes de reemplazar, verificar que sea único

El pizarrón quedó de 18 MB porque busqué un texto que aparecía dos veces en el
archivo y agarró el equivocado.

**Toda edición automática verifica primero que el texto aparezca una sola vez.**
Es una línea de código y evita romper un archivo entero.

---

## LO QUE SE HIZO CON ESTO

No quedó en un documento. Se aplicó:

```
BORRADO      el archivo único y su generador (216 líneas)
BORRADO      el guardado sin internet (ahora se desinstala solo)
BORRADO      el numerador de versiones
BORRADO      el inventario a mano (ahora se deduce)
BORRADO      el generador de esqueletos
FUSIONADO    tres archivos de pruebas en uno
```

De catorce herramientas quedaron seis. De cinco archivos para hacer clic,
quedaron tres.

**Y desapareció el paso que más tiempo hacía perder:** no hay más números de
versión ni copias viejas. Se sube y se ve.

---

## COMO QUEDÓ

```
ABRIR.bat                  todos los días. Revisa y abre. Se cierra solo.
PUBLICAR.bat               publica. Frena si hay algo roto.
LIMPIAR.bat                borra lo que quedó sin uso. Lista explícita.
CREAR_ACCESO_DIRECTO.bat   una sola vez, para el kinesiólogo.

auditar.py      revisa el proyecto. Lo llaman los .bat.
probar.py       las tres pruebas que encontraron errores de verdad.
limpiar.py      la lista de lo que quedó obsoleto, con el motivo de cada uno.
armar_pdf.py    la guía de instalación.
manual_pdf.py   el manual de uso.
```

Y el kinesiólogo no toca nada de esto: abre la dirección publicada.

---

## LO QUE HAY QUE SEGUIR VIGILANDO

**El impulso de agregar.** Es el que causó cuatro de los doce errores. Cuando
aparezca la idea de sumar algo "por las dudas", la respuesta es no.

**Las dos guías en PDF.** Se generan con un script cada una. Si el portal cambia
y nadie las regenera, van a mentir. Eso todavía no está resuelto.

**Los temas que no se usan.** Quedaron dos hojas de estilo de aspectos que
descartamos. Hoy no molestan, pero son cosas que hay que mantener sin que nadie
las use. Si en un mes seguimos con Telemetría, se borran.
