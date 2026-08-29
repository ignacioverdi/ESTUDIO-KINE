# ARMAR LA CARPETA DESDE CERO

> Qué tiene que haber adentro, por qué está cada cosa, y en qué orden llenarla.
> Si querés ver la anatomía sin el ruido del código ya escrito:
> `python3 crear_estudio.py` (o doble clic en `CREAR_ESTUDIO.bat`).

---

## 1. EL INVENTARIO COMPLETO

```
ESTUDIO/
│
├── index.html            puerta de entrada
├── panel.html            el día del kinesiólogo
├── lesiones.html         las fichas ← el corazón
├── agenda.html           turnos
├── mi.html               lo que ve el lesionado
├── diario.html           las cinco preguntas diarias
├── pizarron.html         circuitos en la cancha
├── ejercicios.html       la biblioteca
│
├── css/
│   └── estudio.css       TODO lo visual
├── js/
│   ├── datos.js          la única puerta a la base
│   ├── base.js           encabezado, menú, pista de fases
│   └── firebase.js       ← NO se escribe: se copia de la app del club
├── img/
│   ├── icono-192.png
│   ├── icono-512.png
│   └── logo.png
├── videos/
│   └── LEEME.txt         los videos NO van acá (ver punto 6)
│
├── config.json           la identidad del estudio
├── manifest.json         para que se instale como app
├── sw.js                 para que ande sin internet
├── vercel.json           publicación
├── .gitignore            QUÉ NO SUBE ← leer el punto 5
│
├── LEEME.md              el manual
├── armar_demo.py         junta todo en un archivo
└── crear_estudio.py      genera este esqueleto vacío
```

**Diez de esos veintitrés son obligatorios.** El resto suma, pero sin ellos el
portal arranca igual. Los obligatorios salen marcados con `*` cuando corrés
`crear_estudio.py`.

---

## 2. LAS TRES REGLAS QUE SOSTIENEN TODO

Si más adelante alguien no entiende por qué está armado así, es por esto:

**Todo lo visual vive en `css/estudio.css`.** Ninguna pantalla define un color
propio. Cambiás el azul ahí y cambia en las ocho. Si empezás a poner colores
sueltos en cada HTML, en tres meses tenés nueve azules distintos.

**Toda la base pasa por `js/datos.js`.** Ninguna pantalla llama a Firebase
directo. Por eso hoy funciona con datos de ejemplo y mañana con Firebase sin
tocar ni una pantalla.

**El menú vive en `js/base.js`.** No está repetido nueve veces. Se arma solo
mirando el rol y el `data-pag` del `<body>`.

---

## 3. EN QUÉ ORDEN LLENARLA

Este orden importa: cada paso te deja algo que podés mirar.

```
1. css/estudio.css    primero el aspecto, si no no ves nada
2. js/datos.js        los datos de ejemplo, para tener con qué probar
3. js/base.js         el encabezado y el menú
4. index + panel      ya tenés algo para mostrarle a alguien
5. lesiones           el corazón: fases y criterios
6. agenda + mi        el circuito completo kine ↔ jugador
7. el resto
```

El error clásico es arrancar por las pantallas. Terminás con ocho archivos que
se ven distinto entre sí y después hay que unificarlos a mano.

---

## 4. CÓMO ARRANCAR HOY

```
1. Descomprimir el kit
2. Doble clic en index.html            → ya anda, con datos de ejemplo
3. Copiar firebase.js de la app del club a js/
4. Editar config.json                  → nombre del estudio y horario
5. Reemplazar img/logo.png             → el escudo
6. Cambiar --azul en css/estudio.css   → si querés otro acento
```

Del 1 al 2 tenés el portal funcionando en dos minutos. Del 3 en adelante es
convertirlo en algo real.

---

## 5. LO QUE NO PUEDE SUBIR A GITHUB

Es el punto más importante de toda esta guía.

**Acá se manejan datos de salud.** Un JSON exportado con diagnósticos subido sin
querer a un repo público no se puede "desubir": queda en el historial de git para
siempre, y si el repo era público, en las copias que Google ya hizo.

El `.gitignore` bloquea tres familias:

```
pacientes/  export/  *_lesiones.json  backup_*.json    ← datos clínicos
.env  llave.txt  firebase_admin*.json                   ← llaves
videos/*                                                 ← pesan de más
```

**Antes del primer `git push`, corré esto y mirá la lista con calma:**

```
git status
```

Si aparece algo con nombre de paciente, diagnóstico o dorsal, parás. Una vez que
subiste, ya está.

Y el repo va **privado**. Aunque no tenga datos: las reglas de Firebase y la
estructura de rutas son un mapa de dónde está todo.

---

## 6. LOS VIDEOS

No van al repo. Un video de un ejercicio pesa entre 5 y 50 MB; con treinta
ejercicios el repo se vuelve inmanejable y Vercel lo rechaza.

Van a un hosting de video, y en `kine/ejercicios/<id>/video` se guarda el enlace.
La carpeta `videos/` del repo queda vacía a propósito, solo con el `LEEME.txt`
que explica esto.

---

## 7. LA PARTE DE FIREBASE

`js/firebase.js` **no se escribe**: se copia de la app del club. Ya trae la
sesión, los roles, el modo sin internet y la llave. Está probado con gente
usándolo — reescribirlo es regalar trabajo.

Lo que sí hay que tocar, dos líneas:

```javascript
var VB_STAFF = ['coach','at','pf','kine'];          // el rol nuevo

var VB_PLAYER_PATHS = ['wellness','pesos','rm','prep_hist','notas','obs',
                       'kine/adherencia','kine/agenda/turnos','kine/wellness'];
```

El turno se deja escribir porque el jugador tiene que poder reservar. Que no pise
a otro se valida en la regla de Firebase, **no en el navegador**: cualquiera
puede abrir la consola y saltearse una validación de JavaScript.

**Base de datos aparte de la del club.** Los datos de salud no tienen por qué
vivir donde vive el scouting, y un estudio puede atender a más de un club.

---

## 8. PUBLICAR

```
1. Repo nuevo en GitHub, PRIVADO
2. git init && git add . && git commit -m "base del portal"
3. git remote add origin <url> && git push -u origin main
4. En Vercel: importar el repo → deploy
5. Dominio propio (estudio.tuclub.com o el que sea)
```

De ahí en adelante, cada `git push` publica solo. `vercel.json` ya trae las
cabeceras de seguridad y las URLs limpias.

**Un detalle que muerde:** si tocás una pantalla, subí el número de `VERSION` en
`sw.js`. Si no, el navegador sigue mostrando la copia guardada y vas a pasarte
una hora preguntándote por qué no se ve el cambio.

---

## 9. LA LISTA ANTES DE MOSTRARLO

```
[ ] Abre index.html sin errores en la consola
[ ] Se ve bien en un celular de verdad, no solo achicando la ventana
[ ] git status limpio: ningún dato de paciente
[ ] El repo es privado
[ ] config.json tiene el nombre y el horario reales
[ ] El logo no es el de ejemplo
[ ] El botón de avanzar de fase está apagado si faltan criterios
[ ] Un jugador NO puede ver la ficha de otro
```

El último es el que hay que probar de verdad, entrando con dos cuentas
distintas. Es el que te hace perder el cliente si falla.

---

## 10. LO QUE TODAVÍA NO ESTÁ

```
1. Formulario de sesión nueva          hoy es un alert ← lo próximo
2. Alta de lesión                      hoy las tres son de ejemplo
3. Subida de video por ejercicio       la biblioteca ya tiene el lugar
4. Cruce del diario con la lesión      la señal más temprana que vas a tener
5. Aviso del turno una hora antes      el canal push ya existe en la app del club
6. Semáforo embebido en la app del club
```

El primero es el que el kinesiólogo va a usar quince veces por día.
