# INSTALAR Y PUBLICAR — paso a paso

> Para Windows. Si algo ya lo tenés instalado del repo del club, saltealo.
> Al final de cada paso hay cómo comprobar que salió bien.

---

## PARTE 1 — ARRANCAR (un clic)

### Descomprimir

Descomprimí `ESTUDIO_KIT.zip` donde tengas tus proyectos. Por ejemplo
`C:\Proyectos\ESTUDIO\`.

**No lo dejes en Descargas.** Windows a veces bloquea archivos ahí y después
pasás una hora buscando por qué no anda.

### Doble clic en EMPEZAR.bat

Eso es todo. Ese archivo solo:

```
1. Revisa si están Python y Git, y si falta alguno te abre la descarga
2. Configura tu identidad de Git si es la primera vez
3. Sube el número de versión del sw.js si cambió algo
4. Regenera el archivo único
5. Corre la auditoría
6. Levanta el portal y te abre el navegador
```

**Comprobación:** se abre el navegador en `localhost:8080` con fondo casi negro,
una retícula finísima y "VIERNES 28 DE AGOSTO" en versalitas celestes.

Dejá la ventana negra abierta mientras trabajás. Para cortar, Ctrl+C.

### Si te dice que falta Python

Te abre la página de descarga solo. **Al instalar, tildá "Add python.exe to
PATH"**: está abajo de todo en la primera pantalla y es facilísimo pasarla por
alto. Sin eso, nada funciona.

Después volvé a hacer doble clic en `EMPEZAR.bat`.

---

## PARTE 2 — EL EDITOR

Si ya usás alguno, seguí con ese. Si no, **VS Code**
(code.visualstudio.com): es gratis y sirve para abrir la carpeta entera de una,
no archivo por archivo. Con la carpeta abierta, buscar algo en todos los
archivos es Ctrl+Shift+F.

---

## PARTE 3 — PUBLICAR (el otro clic)

### Doble clic en PUBLICAR.bat

También hace todo solo:

```
1. Prepara y audita — si hay algo roto, FRENA y no sube nada
2. La primera vez, te conecta con GitHub pidiéndote la URL del repo
3. Te muestra exactamente qué se va a subir
4. Te pide escribir SI
5. Sube, y Vercel publica en un minuto
```

**Los pasos 1 y 3 están puestos a propósito.** El primero evita publicar algo
roto. El tercero es el último momento para frenar si se coló un dato de
paciente: una vez subido, queda en el historial de git para siempre.

### Lo único que hay que hacer a mano: crear el repo

Antes del primer `PUBLICAR.bat`, entrá a **github.com**:

```
New repository
Nombre:       ESTUDIO_KINE
Visibilidad:  PRIVATE  ← acá no hay discusión
NO tildes README, .gitignore ni licencia: el kit ya los trae y se pisan
```

Copiá la URL que te queda y pegala cuando `PUBLICAR.bat` te la pida.

**Por qué privado aunque no tenga datos:** las reglas de Firebase y la estructura
de rutas son un mapa de dónde está todo. Y el día que alguien exporte una ficha
para probar algo, el repo ya va a estar creado: si nació público, ese día es
tarde.

---

## PARTE 4 — VERCEL (una sola vez)

### Vercel

1. Entrá a **vercel.com** y elegí **Continue with GitHub**
2. **Add New** → **Project**
3. Buscá `ESTUDIO_KINE` en la lista → **Import**
4. No cambies nada de la configuración: es HTML suelto, no hay que compilar
5. **Deploy**

En menos de un minuto tenés una dirección tipo
`estudio-kine.vercel.app` funcionando.

`vercel.json` ya trae las cabeceras de seguridad y las URLs limpias.

### Tu propio dominio (opcional)

En el proyecto de Vercel: **Settings** → **Domains** → agregá el que quieras
(por ejemplo `estudio.tuclub.com`). Vercel te dice qué hay que cargar en el
panel de tu dominio.

---

## PARTE 5 — CONECTAR FIREBASE

Esto convierte el portal de una demo en algo real. Hasta acá todo funciona con
los datos de ejemplo de `js/datos.js`.

### Base de datos propia

**Aparte de la del club.** Los datos de salud no tienen por qué vivir donde vive
el scouting, y un estudio puede atender a más de un club.

1. **console.firebase.google.com** → Agregar proyecto
2. Realtime Database → Crear → **modo bloqueado**
3. Copiá las credenciales que te da

### Copiar firebase.js

Copiá `firebase.js` del repo del club a `js/firebase.js` de acá, reemplazando el
archivo vacío que viene.

**No lo reescribas.** Ya trae la sesión, los roles y el modo sin internet, y está
probado con gente usándolo.

Cambiale las credenciales por las del proyecto nuevo, y tocá dos líneas:

```javascript
var VB_STAFF = ['coach','at','pf','kine'];

var VB_PLAYER_PATHS = ['wellness','pesos','rm','prep_hist','notas','obs',
                       'kine/adherencia','kine/agenda/turnos','kine/wellness'];
```

### Las reglas

En Firebase, pestaña Reglas. La idea es esta:

```
kine/disponibilidad   → la lee cualquiera del club, la escribe solo el kine
kine/lesiones         → la lee el kine y el propio jugador. NADIE MÁS.
kine/agenda/turnos    → la lee el kine, el jugador escribe solo el suyo
kine/adherencia       → cada jugador escribe solo la suya
```

Que un jugador no pueda pisar el turno de otro se valida **acá**, no en el
navegador: cualquiera abre la consola del navegador y se saltea un `if`.

---

## LA LISTA ANTES DE MOSTRARLO

```
[ ] EMPEZAR.bat termina sin nada en ROTO
[ ] Se ve bien en un celular de verdad, no achicando la ventana
[ ] El repo es PRIVADO
[ ] git status limpio: ningún dato de paciente
[ ] config.json tiene el nombre y el horario reales
[ ] Un jugador NO puede ver la ficha de otro   ← probalo con dos cuentas
```

El último es el único que hay que probar entrando de verdad con dos usuarios
distintos. Es el que te hace perder el cliente si falla.

---

## CUANDO ALGO NO ANDA

**"No se ve el cambio que hice."**
Corré `EMPEZAR.bat`: sube la versión del `sw.js` solo y eso obliga al navegador a
soltar la copia guardada. Si aun así lo ves viejo, probá en una ventana de
incógnito.

**"python no se reconoce como un comando."**
No tildaste "Add to PATH" al instalar. Reinstalá Python tildándolo.

**"Se ve todo blanco y sin formato."**
Estás abriendo un HTML suelto, sin la carpeta. Descomprimí todo junto.

**"git push me rechaza la contraseña."**
GitHub ya no acepta la contraseña normal. Generá un token (paso 7).

**"Vercel publica pero se ve viejo."**
Fijate en la pestaña Deployments si el último dio error. Y probá en una ventana
de incógnito para descartar la copia guardada.

---

## APÉNDICE — POR QUÉ SOLO DOS BOTONES

Antes esto eran cinco archivos y varios pasos que había que acordarse de hacer
en orden. Ahora son dos, y el paso que más se olvidaba se hace solo.

```
EMPEZAR.bat     revisa la maquina, prepara, audita y abre el portal
PUBLICAR.bat    prepara, audita, muestra que sube y publica
```

Adentro los mueve `preparar.py`, que hace tres cosas:

**Sube el número de versión del `sw.js`, pero solo si cambió algo.** Calcula una
firma de todos los archivos que el portal entrega; si difiere de la anterior,
sube la versión. Sin esto, el navegador sigue mostrando la copia guardada y uno
jura que el cambio no se aplicó. Era el error que más tiempo hacía perder y
ahora no puede pasar.

**Regenera `ESTUDIO.html`**, el archivo único que se manda por WhatsApp.

**Corre `auditar.py`**, que revisa enlaces rotos, archivos que faltan, tokens que
ningún tema define y claves expuestas. Si encuentra algo roto, `PUBLICAR.bat`
frena antes de subir.

`crear_estudio.py` sigue estando para armar la carpeta desde cero, pero no es de
uso diario.
