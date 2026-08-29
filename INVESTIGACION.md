# QUÉ LE FALTA AL PORTAL

> Investigación de agosto de 2026. Tres frentes: qué hacen los productos que
> lideran el mercado, qué dice la evidencia clínica, y qué exige la ley argentina.
>
> Está ordenado por **urgencia real**, no por lo vistoso. Lo primero no es lo más
> lindo: es lo que hoy incumple una obligación legal.

---

## RESUMEN EN CINCO LÍNEAS

1. La historia clínica electrónica tiene requisitos legales que el portal no cumple.
2. Los datos de salud alojados fuera del país tienen un problema con la ley 25.326.
3. Falta lo más pedido y lo más simple: que el paciente le pueda escribir al kinesiólogo.
4. La adherencia al programa domiciliario ronda el 20%. Ahí se define todo.
5. Las fases por criterios ya son la decisión correcta, y hay evidencia dura que la respalda.

---

# PARTE 1 — LO QUE LA LEY EXIGE (no es opcional)

## 1.1 La historia clínica electrónica

La **Ley 26.529** define la historia clínica como un documento obligatorio,
cronológico, foliado y completo donde consta toda actuación realizada al paciente.
Su artículo 13 permite hacerla en soporte informático, pero exige asegurar
**integridad, autenticidad, inalterabilidad, perdurabilidad y recuperabilidad**.
Y pide concretamente accesos restringidos con claves, medios no reescribibles y
control de modificación de campos.

**Qué falta en el portal:**

| Exigencia | Estado hoy |
|---|---|
| Cada registro con fecha, hora y profesional | Las sesiones guardan fecha, falta hora y quién |
| Inalterable: no se puede editar el pasado en silencio | Hoy se sobrescribe sin dejar rastro |
| Registro de quién accedió a qué y cuándo | No existe |
| Numeración correlativa sin saltos | No existe |
| Copia al paciente en 48 horas | No existe |

El artículo 14 es el más directo: **el paciente es el titular de su historia
clínica**, y a su simple pedido hay que entregarle una copia dentro de las 48
horas. Hoy no hay forma de exportarla.

**Qué hacer:** que cada escritura clínica genere un registro nuevo en vez de pisar
el anterior, con fecha, hora y autor; un botón "descargar mi historia clínica" en
PDF del lado del paciente; y una bitácora de accesos.

Es la funcionalidad menos vistosa de toda esta lista y la única que puede traer un
problema serio.

## 1.2 Dónde viven los datos

La **Ley 25.326**, artículo 8, habilita a los profesionales de la salud a tratar
datos de salud. Pero su artículo 12 **prohíbe transferir datos personales a países
que no ofrezcan niveles de protección adecuados.**

Hoy el portal corre en Vercel y Firebase, con servidores fuera del país. Eso no es
automáticamente ilegal, pero conviene mirarlo con un abogado antes de tener
trescientas historias clínicas adentro, no después. Existe la lectura de que basta
con que el proveedor tenga entidad legal en el país.

También exige **consentimiento expreso, por escrito, previo e informado**, y que
figure "en forma expresa y destacada". El portal ya lo pide en el alta, lo cual
está bien. Falta poder revocarlo: el consentimiento es revocable por ley.

## 1.3 Si en algún momento hay videollamada

La **Resolución 3316/2023** del Ministerio de Salud fijó las directrices para la
teleconsulta. Entre otras cosas, las plataformas deben estar **registradas ante la
autoridad jurisdiccional e inscriptas en el Ministerio de Salud** según el Decreto
98/23 y la Resolución 305/2023.

Traducción práctica: **la videollamada no es una función más.** Si se agrega, el
portal pasa a ser una plataforma de teleasistencia con obligaciones de registro. No
la pongas sin averiguar eso primero.

---

# PARTE 2 — LO QUE MÁS IMPACTO TIENE

## 2.1 Mensajería entre paciente y kinesiólogo

Es lo que pediste como objetivo central y hoy no existe. En las reseñas de los
usuarios de Physitrack aparece como una de las funciones más valoradas: poder
preguntar algo y ajustar el programa sobre la marcha.

Hoy el portal es de una sola dirección: el kine manda, el paciente cumple. Falta la
vuelta.

**Cómo hacerlo bien, y no como un WhatsApp:**

- **Anclada al ejercicio o a la sesión**, no un chat suelto. "Esto me duele acá"
  colgado del ejercicio concreto vale diez veces más que el mismo mensaje suelto.
- **Con expectativa explícita de respuesta.** "Vero responde en el día" o "responde
  antes de tu próximo turno". La peor versión es un chat donde el paciente escribe
  a las 3 de la mañana y cree que alguien lo va a leer.
- **Con un aviso claro de qué NO es**: no es una guardia. Si hay una urgencia, se
  llama por teléfono.
- **Guardada en la historia clínica**, porque es parte de la actuación profesional.

## 2.2 Recordatorio automático del turno

El ausentismo en kinesiología ambulatoria se ubica entre el 8% y el 25% según la
fuente, y es más alto que en otras especialidades porque el tratamiento exige
sostener la conducta durante semanas.

Un ensayo aleatorizado en Ginebra con 6.450 pacientes comparó recordatorio por
mensaje de texto contra llamada telefónica: **el mensaje resultó equivalente en
efectividad y bastante más barato**, y tres de cada cuatro pacientes encuestados
recomendaron implementarlo.

El portal ya es una app instalable y el canal de avisos push ya existe en la app
del club. **Esto es de las cosas más fáciles de agregar y de las que más se notan.**

Y sumale la vuelta: que el paciente pueda confirmar o cancelar desde el aviso. Un
turno cancelado con doce horas de anticipación se le puede dar a otro.

## 2.3 La adherencia es el problema central

Una revisión sistemática que reunió veintitrés estudios encontró que **la adherencia
al ejercicio domiciliario ronda el 21%**. En un estudio español bajó al 10%.

Cuatro de cada cinco pacientes no hacen lo que se les indicó. Ahí es donde se pierde
la mitad de las recuperaciones, no en el consultorio.

Lo que dice la evidencia sobre qué funciona, y conviene leerlo con cuidado porque
es incómodo:

- Una revisión de intervenciones para mejorar la adherencia encontró **evidencia
  fuerte de que las estrategias no funcionan a largo plazo** en el ejercicio
  domiciliario. Hay evidencia moderada de que los abordajes motivacionales
  cognitivo-conductuales mejoran la asistencia a las sesiones presenciales.
- Sobre lo digital hay mejores noticias: una revisión de diez ensayos aleatorizados
  con 1.117 participantes encontró que **siete de los diez mostraron mejor
  adherencia con la herramienta digital**; los otros tres, equivalencia. Los tres
  que empataron eran los de seguimiento más largo, lo que sugiere que el efecto se
  desgasta con el tiempo.
- El factor pronóstico que más aparece es la **autoeficacia**: la confianza del
  paciente en que puede hacerlo. Los pacientes con síntomas depresivos y los más
  fatigados abandonan más.

**Qué implica para el portal:** el marcador de rachas y los premios sirven al
principio y se gastan. Lo que sostiene la adherencia es que el paciente **crea que
puede** y que **vea que sirve**. Eso se construye mostrándole su propio progreso —
"hace tres semanas no podías apoyar el pie treinta segundos y hoy sí" — mucho más
que con una medalla.

Ahí el portal ya tiene una ventaja: la pista de cinco fases con criterios concretos
es exactamente eso. Falta explotarla: gráfico de dolor a lo largo del tiempo,
comparación con el lado sano, hitos concretos alcanzados.

## 2.4 Cuestionarios validados de resultado

Los productos líderes los llaman PROMs. Son cuestionarios estandarizados que mide
el propio paciente, y son el estándar de la kinesiología moderna porque permiten
demostrar que el tratamiento sirvió, con un número comparable.

El portal hoy mide dolor y esfuerzo, que es un buen comienzo pero es invención
propia. Los validados permiten comparar contra la literatura y contra otros
pacientes.

Los que conviene sumar, según zona:

- **Rodilla:** KOOS, o el IKDC para deportistas
- **Hombro:** DASH o QuickDASH
- **Lumbar:** Oswestry, o el Roland-Morris
- **Tobillo:** FAAM
- **Genérico:** EQ-5D-5L para calidad de vida

Una advertencia que apareció en la investigación: los pacientes valoran los
cuestionarios, pero se quejan cuando se completan **a costa del tiempo de consulta**
y cuando son repetitivos en tratamientos largos. Van al inicio, cada cuatro semanas
y al alta. No todas las sesiones.

## 2.5 Alertas por señales, no por reportes

Esto no lo tiene casi nadie y el portal está a un paso.

Ya se cargan tres cosas a diario: dolor durante los ejercicios, esfuerzo percibido,
y las cinco preguntas del bienestar. Nadie las está cruzando.

Reglas concretas que valdría la pena implementar:

```
Dolor en alza tres días seguidos          → avisar al kine
Adherencia por debajo del 50% en la semana → avisar al kine
Dolor post-sesión mayor al previo, 2 veces → revisar la carga
Sin registro por cinco días                → el paciente se está soltando
Un criterio de fase cumplido               → felicitar al paciente
```

**El kinesiólogo se entera antes de que el paciente se lo cuente.** Eso es lo que
diferencia una herramienta de una planilla, y es coherente con la decisión que ya
tomaste de que las fases avanzan por criterio.

---

# PARTE 3 — LA PARTE DEPORTIVA

## 3.1 El criterio le gana al calendario, y hay evidencia

La decisión de fondo del portal está bien tomada, y ahora tiene respaldo explícito.

La literatura sobre retorno al juego cambió: históricamente el alta se daba por
tiempo transcurrido desde la cirugía, y hoy se demuestra que **el regreso prematuro
aumenta significativamente el riesgo de recaída**. En ligamento cruzado anterior,
volver antes de los nueve meses puede multiplicar por siete el riesgo de una
segunda lesión, y cada mes adicional hasta los nueve lo reduce.

Una revisión de lesiones de cadera e ingle en fútbol concluye lo mismo: la
evidencia respalda un abordaje **multidimensional y basado en criterios**, que
integre recuperación clínica, capacidad funcional y rendimiento específico del
deporte, en lugar del alta por tiempo.

**El botón de avanzar deshabilitado hasta cumplir los criterios es, literalmente,
lo que recomienda la evidencia.**

## 3.2 Lo que falta en los criterios actuales

Dos cosas aparecen una y otra vez y el portal no las tiene:

**La simetría medida, no estimada.** El estándar son los tests de salto con un
índice de simetría de al menos 90% respecto de la pierna sana. Hoy los criterios
del portal dicen "fuerza al 80% del lado sano" pero no hay dónde cargar el número.
Debería haber un test con dos valores y el porcentaje calculado.

Pero ojo con un matiz importante: los estudios biomecánicos muestran que **un
atleta puede lograr simetría en la distancia del salto y seguir aterrizando de
forma asimétrica**, con la rodilla metiéndose hacia adentro. El número solo no
alcanza: hay que mirar cómo aterriza. Por eso conviene filmar el aterrizaje, y el
portal ya tiene reproductor de video.

**La disposición psicológica.** La recuperación física no garantiza el retorno
exitoso. Existen cuestionarios validados para esto, como el ACL-RSI. Un jugador que
tiene miedo al gesto que lo lesionó no está de alta, aunque la rodilla esté
perfecta. En los criterios de fase 4 del portal ya escribí "sin miedo al gesto que
lo lesionó" — eso hay que convertirlo en algo que se mida.

---

# PARTE 4 — CONTRA LOS QUE YA ESTÁN

El referente del mercado es Physitrack, con su app para pacientes PhysiApp. Lo usan
más de 110.000 profesionales en 174 países, cuesta desde 21,99 dólares por
profesional por mes, y tiene certificaciones HIPAA, GDPR e ISO 27001.

**Lo que ellos tienen y vos no:**

- Biblioteca de más de 18.000 ejercicios en video, ya filmados
- Cuestionarios validados integrados
- Videollamada adentro de la app
- Integración con sistemas de gestión y de historia clínica
- Marca blanca: la clínica pone su propio logo
- Certificaciones de seguridad

**Lo que vos tenés y ellos no:**

- **El parte médico separado del diagnóstico.** Ellos no tienen el problema del
  cuerpo técnico porque no atienden clubes. Vos sí, y lo resolviste bien.
- **El pizarrón de circuitos en cancha.** Ellos tienen ejercicios sueltos en video.
  Un circuito de cuatro postas con recorridos dibujados es otra cosa.
- **La conexión con el entrenamiento.** El bienestar diario, las rutinas del
  preparador físico, el calendario. Ellos son una isla; vos estás adentro del club.
- **Está en castellano rioplatense y escrito por alguien que conoce el ambiente.**
  Eso no es menor para vender en Argentina.

**Y dos quejas reales de sus usuarios, que conviene no repetir:** que la app tarda
mucho en cargar los ejercicios, y que el programa a veces se corta y hay que salir
y volver a entrar. El portal es HTML estático servido desde una red de distribución
y funciona sin internet: en eso ya arranca mejor.

---

# PARTE 5 — EL ORDEN QUE PROPONGO

**Primero, lo legal.** No es negociable y es lo menos vistoso.

```
1. Registro clínico inalterable: fecha, hora, autor, sin pisar el pasado
2. Exportar la historia clínica en PDF, del lado del paciente
3. Bitácora de accesos
4. Poder revocar el consentimiento
```

**Segundo, lo que más se nota.**

```
5. Mensajería anclada al ejercicio y a la sesión
6. Recordatorio del turno con confirmar o cancelar
7. Alertas por señales cruzando dolor, adherencia y bienestar
8. Gráfico de evolución del dolor, para el paciente
```

**Tercero, lo que lo pone a la altura de los que ya están.**

```
9. Cuestionarios validados por zona (KOOS, DASH, Oswestry, FAAM)
10. Tests funcionales con índice de simetría calculado
11. Video del aterrizaje adentro del criterio de fase
12. Biblioteca de video propia, filmada en el estudio
```

**Cuarto, cuando haya plata y abogado.**

```
13. Videollamada (requiere inscripción ante el Ministerio de Salud)
14. Servidores con entidad legal en el país
15. Marca blanca, para vender el portal a otros estudios
```

---

# LO QUE YO NO HARÍA

**Rachas, medallas y puntajes como eje.** La evidencia dice que no sostienen la
adherencia a largo plazo. Sirven las primeras semanas y después se apagan. Es mejor
poner esa energía en mostrarle al paciente su propio progreso concreto.

**Inteligencia artificial que corrige el movimiento por la cámara.** Ya existe y
está certificado como dispositivo médico clase IIa en Europa. Competir ahí es
competir contra empresas con certificación regulatoria y años de desarrollo. No es
el terreno.

**Una biblioteca de 18.000 ejercicios.** No podés ganar por volumen. Podés ganar
con doscientos ejercicios filmados en el estudio, con la voz del kinesiólogo que
atiende y en el idioma del paciente. Eso es más valioso que 18.000 genéricos.

---

## FUENTES CONSULTADAS

Ley 26.529 de Derechos del Paciente · Ley 25.326 de Protección de Datos Personales ·
Resolución 3316/2023 del Ministerio de Salud sobre teleconsulta · revisiones
sistemáticas sobre adherencia al ejercicio domiciliario · ensayo aleatorizado de
Ginebra sobre recordatorios de turno · literatura sobre retorno al juego en
ligamento cruzado y lesiones de ingle · documentación pública de Physitrack.
