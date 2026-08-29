# ESTUDIO — kit del portal de kinesiología

> Versión base, agosto 2026. Es un portal aparte de la app del club:
> repo propio, dominio propio, Firebase propio.

---

## 1. QUÉ HAY ACÁ

```
index.html        puerta de entrada (elegís rol para probar las dos vistas)
panel.html        el día del kinesiólogo: turnos, activas, semáforo
lesiones.html     las fichas: fases, criterios, sesiones, programa
agenda.html       los turnos (sirve para el kine y para el jugador)
pizarron.html     los circuitos en cancha
ejercicios.html   la biblioteca del estudio
mi.html           la vista del jugador lesionado
diario.html       la carga diaria de cómo se siente

css/estudio.css   TODO lo visual. Ninguna pantalla define colores propios.
js/datos.js       la única puerta a la base
js/base.js        encabezado, menú, la pista de recuperación, escalas
manifest.json     para que se instale como app en el celular
img/              los iconos
```

Se abre con doble clic en `index.html`. No necesita servidor ni internet
para verlo: los datos de ejemplo están adentro.

---

## 2. LA IDENTIDAD

Es a propósito distinta de la app de vóley. Aquella es teal sobre azul noche,
para leer de noche en un banco de suplentes. Ésta es una ficha clínica: papel
claro, tinta oscura, un acento azul.

**El acento no puede ser verde, ámbar ni rojo.** Esos tres colores ya significan
disponible, limitado y de baja. Si además fueran decoración de marca, el semáforo
dejaría de leerse de un vistazo. Por eso el azul.

**Tipografía:** IBM Plex Sans para el texto, IBM Plex Mono para todo lo que es
dato — días, dorsales, fechas, rangos de dolor. Plex se diseñó para documentación
técnica y los números en mono hacen que la pantalla se lea como una planilla.
Space Grotesk para los títulos.

**El elemento firma es la pista de recuperación:** cinco tramos con una marca en
el actual, como una regla. Aparece igual en el panel, en la ficha y en la
pantalla del jugador. Es siempre la misma lectura: dónde está y cuánto falta.

Está en `base.js`, función `pista()`. Si se cambia ahí, cambia en todos lados.

---

## 3. EL MODELO DE DATOS

```
kine/
  disponibilidad/<dorsal>   ← LO ÚNICO QUE VE EL CUERPO TÉCNICO
      { estado:'ok'|'limitado'|'baja', motivo, desde, hasta }

  lesiones/<id>             ← dato clínico: kine + el propio jugador
      { dorsal, zona, lado, diagnostico, mecanismo, fecha,
        fase:1..5, estado, alta, criterios:[], sesiones:[] }

  agenda/turnos/<fecha>/<hora>
      { dorsal, tipo, estado:'reservado'|'atendido'|'ausente' }

  programas/<lesion_id>/<fase>
  ejercicios/<id>           los circuitos del pizarrón, como datos
  adherencia/<dorsal>/<fecha>
  wellness/<dorsal>/<fecha>
```

### Por qué la disponibilidad está separada del diagnóstico

Es la decisión más importante del portal y conviene no aflojarla.

El entrenador necesita saber quién está para el sábado. No necesita saber el
diagnóstico. Son datos de salud: si el detalle clínico viviera en la misma rama,
el día que le des acceso al cuerpo técnico les diste la historia clínica entera.

Separadas, la regla de Firebase se escribe en una línea.

---

## 4. ENCHUFAR FIREBASE

Todo pasa por `js/datos.js`. Ninguna pantalla habla con la base directo.

**Qué hay que hacer:**

1. Copiar `firebase.js` de la app del club. Ya trae sesión, roles, funcionamiento
   sin internet y la llave. No lo reescribas: está probado con gente usándolo.

2. Sumar `kine` como rol de staff, y las ramas propias del lesionado:

   ```javascript
   var VB_STAFF = ['coach','at','pf','kine'];
   var VB_PLAYER_PATHS = ['wellness','pesos','rm','prep_hist','notas','obs',
                          'kine/adherencia','kine/agenda/turnos','kine/wellness'];
   ```

   El turno se deja escribir porque el jugador tiene que poder reservar. Que no
   pise a otro se valida en la regla de Firebase, no en el navegador.

3. Reemplazar el cuerpo de `guardar()` y cargar `BASE` con `fbGet`. Las pantallas
   no cambian.

**Permisos:**

| | disponibilidad | lesiones | agenda | adherencia |
|---|---|---|---|---|
| kine | escribe | escribe | escribe | lee |
| entrenador / PF | lee | — | lee | — |
| jugador | la suya | la suya | reserva la suya | escribe la suya |

---

## 5. LAS CINCO FASES

El eje del portal no es cuántas sesiones hizo, es en qué fase está y qué le falta.

| Fase | Nombre | Cancha |
|---|---|---|
| 1 | Protección | No |
| 2 | Rango y fuerza | No |
| 3 | Readaptación | Gimnasio |
| 4 | Reintegro | Parcial |
| 5 | Alta | Sí |

**El botón de avanzar está deshabilitado hasta que estén todos los criterios
tildados.** Eso es lo que separa una herramienta de una planilla de asistencia.
Probalo con Ibarra: tiene tres de cuatro y el botón sigue apagado.

Los criterios de fase 3 y 4 tienen que mirar el aterrizaje, no solo el dolor: en
deportes de salto, la mayoría de las roturas de ligamento cruzado ocurren al
aterrizar, y el trabajo neuromuscular baja el riesgo a la mitad en la ventana de
14 a 18 años.

---

## 6. EL PIZARRÓN

El circuito **se guarda como datos, no como imagen**: posiciones, trazos y textos
de cada posta. Por eso después se puede animar, traducir a otro idioma, o mostrar
en el celular del jugador con el video al lado. Un PNG no permite nada de eso.

**Sumar un elemento nuevo** (un trineo, una plataforma inestable, una valla alta)
es sumar una línea al objeto `ITEMS` arriba de `pizarron.html`. Nada más cambia:
la paleta se arma sola agrupando por el campo `g`.

Trazos: correr (flecha), conducir (ondulada, con pelota) y pase (punteada).
Canchas: entera, media, espacio reducido y gimnasio.

---

## 7. QUÉ SE REUSA DE LA APP DEL CLUB

**Se copia tal cual:** `firebase.js`, el instalador PWA, los avisos push.

**Se copia el patrón, no el archivo:** el builder del preparador físico y la
pantalla del jugador. El staff arma, el jugador consume, todo por dorsal y fecha.
`pizarron.html` es el builder de acá; `mi.html` es la pantalla del jugador.

**Las cinco métricas del wellness van iguales** — sueño, fatiga, dolor muscular,
ánimo, estrés. Es el índice de Hooper y ya está validado allá. Si los dos sistemas
usan las mismas cinco, el día que se quieran cruzar los datos hablan el mismo idioma.

**No se copia:** nada de los motores. Este portal no tiene `.dvw`, ni `HACER_TODO`,
ni cifrado. Se publica subiendo los HTML.

---

## 8. LO QUE FALTA DEFINIR

- ¿El estudio atiende solo al plantel o también gente de afuera? Si atiende afuera,
  la identidad deja de ser el dorsal y hace falta un padrón propio.
- ¿Cuántos kinesiólogos? Con más de uno, la agenda necesita columna por profesional.
- ¿Hay cobro por sesión u obra social? Es un módulo entero aparte.
- Consentimiento: guardar datos de salud pide un texto de aceptación la primera vez.
- Los instrumentos reales del estudio, para sumar al pizarrón.

---

## 9. LO QUE SIGUE

```
1. Formulario de sesión nueva          hoy es un alert
2. Alta de lesión                      hoy las tres son de ejemplo
3. Subida de video por ejercicio       la biblioteca ya tiene el lugar
4. Cruce wellness × lesión activa      la señal más temprana que vas a tener
5. Aviso del turno una hora antes      el canal push ya existe
6. Semáforo embebido en la app del club   un iframe de solo lectura
```

---

## 10. LA VERSIÓN DE UN SOLO ARCHIVO

`ESTUDIO.html` tiene el portal entero adentro: estilos, datos y las ocho
pantallas. Sirve para mostrarlo sin descomprimir nada — se abre con doble clic
y se manda por WhatsApp.

**El kit de varios archivos es el bueno para trabajar.** El de un archivo se
regenera cuando se toca una pantalla:

Doble clic en `EMPEZAR.bat`. Lo regenera solo, junto con todo lo demás.

Lo único que existe solo ahí es el armazón que hace de router. En el kit real
cada pantalla es un HTML propio y de eso se encarga el navegador.

Un detalle: las tipografías se bajan de Google Fonts. Sin internet el portal
funciona igual pero con las letras del sistema. Para que ande offline hay que
guardar los `.woff2` en `img/` y servirlos desde ahí.
