# INSTALAR Y PUBLICAR — paso a paso

> Para Windows. Si algo ya lo tenés instalado del repo del club, saltealo.
> Al final de cada paso hay cómo comprobar que salió bien.

---

## QUIÉN NECESITA QUÉ

Esto conviene tenerlo claro antes de nada, porque son dos personas distintas
con necesidades distintas.

| | El kinesiólogo | Vos, desarrollando |
|---|---|---|
| Qué abre | `estudio-kine.vercel.app` o el icono | La carpeta del proyecto |
| Necesita Python | No | Sí |
| Necesita Git | No | Sí |
| Ventanas negras | Ninguna, nunca | Ninguna tampoco |
| Pasos para arrancar | Uno: tocar el icono | Uno: `ABRIR.bat` |

**El kinesiólogo no toca un archivo `.bat` en su vida.** Abre el portal publicado
como cualquier página, o lo instala como app y entra desde el icono. Nada más.

---

## PARTE 1 — ARRANCAR (un clic, sin ventanas)

### Descomprimir

Descomprimí el zip en `C:\Proyectos\ESTUDIO`. **No lo dejes en Descargas**:
Windows a veces bloquea archivos ahí y después pasás una hora buscando por qué
no anda.

### Doble clic en ABRIR.bat

Prepara el proyecto, abre el portal y **se cierra solo**. No deja ninguna
ventana.

Si hay algo roto, y solo entonces, se queda abierto para avisarte. Si no tenés
Python instalado, abre igual: el portal no lo necesita para funcionar.

**Comprobación:** fondo casi negro, retícula fina, "VIERNES 28 DE AGOSTO" en
versalitas celestes, y un cartel amarillo arriba avisando que los datos son
inventados.

---

## PARTE 2 — LOS TRES ARCHIVOS DE DOBLE CLIC

```
ABRIR.bat                  todos los días. Prepara y abre. Se cierra solo.
PUBLICAR.bat               cuando querés publicar. Se cierra solo.
CREAR_ACCESO_DIRECTO.bat   una sola vez, para el kinesiólogo.
```

Y uno más que **casi nunca vas a necesitar**:

```
PROBAR_COMO_APP.bat        deja una ventana abierta a propósito
```

Solo sirve para probar tres cosas que el navegador no permite abriendo el
archivo directo: que funcione sin internet, que se instale como app, y los
avisos push. Para trabajar no hace falta.

**Por qué antes había una ventana siempre abierta:** yo había puesto el
servidor local dentro del arranque, y eso obligaba a dejarlo corriendo. No hacía
falta: el portal anda entero con doble clic sobre `index.html`. Lo probé pantalla
por pantalla.

---

## PARTE 3 — QUE EL KINESIÓLOGO LO TENGA A MANO

Doble clic en `CREAR_ACCESO_DIRECTO.bat` en su computadora. Le deja un icono en
el escritorio que abre el portal publicado.

Para que quede como una app de verdad, sin barra de navegador:

```
Computadora   Chrome, los tres puntitos, "Instalar"
Android       aparece un cartel solo; si no, menú y "Instalar app"
iPhone        botón Compartir, "Agregar a inicio"
```

Instalado abre desde el icono, sin barra de navegador, y **funciona sin
internet**.

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

## PARTE 5 — CONECTAR LA BASE (para que los datos se compartan)

**Este es el paso que convierte el portal en algo usable de verdad.**

Sin esto, cada navegador guarda lo suyo. Vos cargás un paciente en tu computadora
y el kinesiólogo no lo ve en la suya. Un paciente se da de alta con el QR desde su
celular y no aparece en la lista. Para probar alcanza; para trabajar no.

Con la base conectada, **todos ven lo mismo desde cualquier aparato, al instante**.

### Crear la base

```
1. console.firebase.google.com  →  Agregar proyecto
2. Realtime Database  →  Crear  →  modo BLOQUEADO
3. Authentication  →  Comenzar  →  activar Correo y contraseña
```

**Modo bloqueado, no de prueba.** El de prueba deja la base abierta a cualquiera
durante 30 días. Son datos de salud.

### Completar tres líneas

Abrí `js/firebase.js`. Arriba de todo hay tres líneas que dicen `PONER_ACA`:

```javascript
var FB_URL  = 'https://tu-proyecto-default-rtdb.firebaseio.com';
var FB_KEY  = 'la apiKey del proyecto';
var FB_DOM  = 'estudio.app';
```

Los dos primeros salen de Firebase, en Configuración del proyecto.

**La apiKey no es un secreto.** Va a la vista en cualquier aplicación web. Lo que
protege los datos son las reglas, no ella.

### Pegar las reglas

Están al final de `js/firebase.js`, listas para copiar. Van en Firebase, en
Realtime Database, pestaña **Reglas**.

Lo que hacen, en una línea: **el cuerpo técnico ve la disponibilidad, nunca el
diagnóstico.** Y un paciente solo ve lo suyo.

### Crear las cuentas

En Firebase, en Authentication, agregá un usuario para el kinesiólogo. Después,
en la base, cargá dos cosas a mano una sola vez:

```
kine/roles/<uid del kinesiólogo>   =  "kine"
kine/uid_pid/<uid de un paciente>  =  "P07"
```

La primera dice quién es el kinesiólogo. La segunda ata cada cuenta con su ficha.

**Las dos tienen escritura prohibida en las reglas, y no es un olvido:** si un
paciente pudiera escribir ahí, se haría kinesiólogo solo y vería todas las
historias clínicas.

### Comprobarlo

Publicá y abrí el portal en dos aparatos distintos. Cargá un paciente en uno y
recargá el otro: tiene que aparecer.

**Mientras las tres líneas digan `PONER_ACA`, el portal funciona igual pero
guardando en cada navegador.** No se rompe nada: simplemente no se comparte.

---

## LA LISTA ANTES DE MOSTRARLO

```
[ ] ABRIR.bat termina sin nada en ROTO
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
Corré `ABRIR.bat`: sube la versión del `sw.js` solo y eso obliga al navegador a
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

## APÉNDICE — POR QUÉ HAY TAN POCAS HERRAMIENTAS

Empezaron siendo catorce. Quedaron seis, después de una limpieza que salió de
haber contado nuestros propios errores. Está explicada en `LECCIONES.md`.

```
ABRIR.bat       todos los días. Revisa y abre. Se cierra solo.
PUBLICAR.bat    publica. Frena si hay algo roto.
LIMPIAR.bat     borra los archivos viejos que quedaron sin uso.
auditar.py      revisa el proyecto. Lo llaman los dos .bat.
probar.py       abre el portal en un navegador de verdad y toca botones.
armar_pdf.py    la guía de instalación en PDF.
manual_pdf.py   el manual de uso en PDF.
```

**Lo que se borró y por qué:** el archivo único (era una segunda aplicación y de
ahí salieron cinco errores), el guardado sin internet (rompía el iPhone), el
numerador de versiones (existía solo por culpa del anterior), el inventario a
mano (se deduce leyendo la carpeta) y tres archivos de pruebas sueltos que ahora
son uno.

**Ya no hay números de versión que subir ni copias viejas que vaciar.** Se sube
y se ve.

**Sobre `LIMPIAR.bat`:** cuando se reemplaza algo, el archivo viejo sigue en la
carpeta, porque descomprimir el zip agrega y reemplaza pero no borra. Ese botón
los saca. Tiene la lista escrita adentro, uno por uno, con el motivo: no adivina
nada. Te muestra qué va a borrar y espera que escribas SI. Si el auditor detecta
archivos viejos, te lo avisa solo.
