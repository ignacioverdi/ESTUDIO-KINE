#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Arma el manual de uso del portal, para el kinesiologo."""

import sys as _sys
for _f in (_sys.stdout, _sys.stderr):
    try:
        if _f and getattr(_f, 'encoding', '') and _f.encoding.lower() not in ('utf-8', 'utf8'):
            _f.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether)

TINTA = colors.HexColor('#0F1922')
GRIS  = colors.HexColor('#546372')
AZUL  = colors.HexColor('#0E7C8A')
VERDE = colors.HexColor('#2E7D4F')
AMBAR = colors.HexColor('#8A5A11')
ROJO  = colors.HexColor('#AE3226')
SUAVE = colors.HexColor('#EEF3F5')
LINEA = colors.HexColor('#C3CCD6')

H1  = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=23, leading=27,
                     textColor=TINTA, spaceAfter=4)
SUB = ParagraphStyle('SUB', fontName='Helvetica', fontSize=11.5, leading=16,
                     textColor=GRIS, spaceAfter=14)
H2  = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=15, leading=19,
                     textColor=AZUL, spaceBefore=15, spaceAfter=7)
H3  = ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=12, leading=16,
                     textColor=TINTA, spaceBefore=9, spaceAfter=4)
P   = ParagraphStyle('P', fontName='Helvetica', fontSize=10.8, leading=15.5,
                     textColor=TINTA, spaceAfter=7)
PASO = ParagraphStyle('PASO', fontName='Helvetica-Bold', fontSize=12, leading=15,
                      textColor=TINTA, spaceAfter=3)
CHICO = ParagraphStyle('CHICO', fontName='Helvetica', fontSize=9.5, leading=13,
                       textColor=GRIS, spaceAfter=5)


def caja(txt, color=AZUL, fondo='#E9F4F6'):
    t = Table([[Paragraph(txt, ParagraphStyle('a', fontName='Helvetica', fontSize=10.3,
                leading=14.5, textColor=color))]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(fondo)),
        ('BOX', (0, 0), (-1, -1), 0.8, color),
        ('LEFTPADDING', (0, 0), (-1, -1), 11), ('RIGHTPADDING', (0, 0), (-1, -1), 11),
        ('TOPPADDING', (0, 0), (-1, -1), 9),   ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
    return t


def paso(n, titulo, cuerpo):
    izq = Table([[Paragraph(str(n), ParagraphStyle('n', fontName='Helvetica-Bold',
                 fontSize=16, textColor=colors.white, alignment=1))]],
                colWidths=[10 * mm], rowHeights=[10 * mm])
    izq.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), AZUL),
                             ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    t = Table([[izq, [Paragraph(titulo, PASO), Paragraph(cuerpo, P)]]],
              colWidths=[14 * mm, 151 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('LEFTPADDING', (0, 0), (0, 0), 0),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
    return KeepTogether(t)


def tabla(cab, filas, anchos, color=AZUL):
    t = Table([cab] + filas, colWidths=anchos)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, LINEA),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SUAVE]),
        ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8)]))
    return t


def pie(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm, 'Portal de kinesiologia — como se usa')
    canvas.drawRightString(188 * mm, 12 * mm, 'Pagina %d' % doc.page)
    canvas.setStrokeColor(LINEA)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


d = []

# ── PORTADA ────────────────────────────────────────────────────────────
d.append(Paragraph('Como se usa el portal', H1))
d.append(Paragraph('Manual para el kinesiologo. No hace falta leerlo entero: cada '
                   'seccion es una tarea suelta. Buscá la que necesites.', SUB))

d.append(caja('<b>Adentro del portal hay ayuda en cada pantalla.</b><br/><br/>'
              'Arriba a la derecha de todas las pantallas hay un boton redondo con un '
              'signo de pregunta. Tocalo y te explica esa pantalla: para que sirve, como '
              'se usa paso a paso, y donde suele estar la trampa.<br/><br/>'
              'Este manual es lo mismo, pero en papel y todo junto.'))
d.append(Spacer(1, 6 * mm))

d.append(Paragraph('Que hay en el menu', H2))
d.append(tabla(['Seccion', 'Para que sirve'], [
    ['Panel', 'La pantalla de arranque. Los turnos de hoy, la plata del mes\ny como esta el plantel.'],
    ['Agenda', 'Los turnos. Dar, cambiar, marcar quien vino.'],
    ['Lesiones', 'Las fichas de los que estan en tratamiento.'],
    ['Pacientes', 'El padron: todos los que pasaron por el estudio.'],
    ['Historias', 'La historia clinica completa de cada uno. Documento legal.'],
    ['Programas', 'Cargar los ejercicios que hace en casa.'],
    ['Caja', 'Ingresos, egresos, planes y sesiones que le quedan a cada uno.'],
    ['Mi perfil', 'Tu foto, tu logo, tu matricula. Y el boton de vaciar.'],
    ['Cartel', 'El cartel con el codigo QR para pegar en la recepcion.'],
    ['Pizarron', 'Dibujar circuitos en la cancha.'],
    ['Ejercicios', 'La biblioteca de ejercicios con video.'],
], [34 * mm, 131 * mm]))

d.append(PageBreak())

# ── EL PRIMER DIA ──────────────────────────────────────────────────────
d.append(Paragraph('El primer dia', H1))
d.append(Paragraph('Tres cosas, una sola vez. Despues no se vuelven a hacer.', SUB))

d.append(paso(1, 'Vaciar los pacientes de prueba',
              'El portal viene con pacientes inventados para que se vea funcionando. '
              'Marcela Rios y Diego Sosa no existen.<br/><br/>'
              'Anda a <b>Mi perfil</b>, baja hasta abajo de todo, y usa el boton para '
              'vaciar. Te va a pedir escribir la palabra VACIAR.<br/><br/>'
              'Se borran los pacientes inventados. <b>No</b> se borran las plantillas de '
              'lesion ni la biblioteca de ejercicios: eso es la herramienta.'))

d.append(caja('<b>Haceló antes de cargar tu primer paciente de verdad.</b> Si no, dentro de '
              'un mes no vas a saber cual es real y cual inventado. En una historia clinica '
              'eso no se puede permitir.', ROJO, '#FBEDEB'))
d.append(Spacer(1, 5 * mm))

d.append(paso(2, 'Cargar tus datos',
              'En la misma pantalla de <b>Mi perfil</b>: tu foto, el logo del estudio, tu '
              'nombre, tu matricula y tu telefono.<br/><br/>'
              'La matricula sale impresa en la historia clinica, que es un documento '
              'profesional. Y el telefono es al que te llegan los avisos cuando alguien '
              'reserva un turno.'))

d.append(paso(3, 'Imprimir el cartel',
              'Anda a <b>Cartel</b> y toca <b>Imprimir el cartel</b>. Sale en una hoja, en '
              'blanco y negro.<br/><br/>'
              'Pegalo donde entra la gente. Ese codigo QR es lo que hace que no tengas que '
              'cargar datos de pacientes nunca mas.'))

d.append(Paragraph('El horario del estudio', H2))
d.append(Paragraph('En <b>Agenda</b>, abajo, esta el horario: a que hora abris, a que hora '
                   'cerras, y cuantos minutos dura cada turno. Con eso se arma la grilla de '
                   'toda la semana.', P))

d.append(PageBreak())

# ── SUMAR PACIENTES ────────────────────────────────────────────────────
d.append(Paragraph('Sumar un paciente', H1))
d.append(Paragraph('La idea de fondo: vos no cargas datos. Los carga el paciente.', SUB))

d.append(Paragraph('Como funciona', H2))
d.append(paso(1, 'El paciente escanea el codigo',
              'Apunta la camara del celular al QR del cartel. Se le abre un formulario.'))
d.append(paso(2, 'Completa sus datos en dos minutos',
              'Nombre, documento, telefono, por que viene, de que trabaja, que deporte hace, '
              'cirugias anteriores y que quiere volver a poder hacer. Y autoriza que guardes '
              'sus datos, que por ley es obligatorio.'))
d.append(paso(3, 'Aparece solo en tu padron',
              'Entra a <b>Pacientes</b> y ahi esta, marcado como <b>sin atender</b>. Ese '
              'cartelito se le va cuando le cargues la primera sesion.'))

d.append(caja('<b>Si no tenes el cartel a mano</b>, en <b>Pacientes</b> hay botones para '
              'mandarle el enlace por WhatsApp o para compartirlo. Es lo mismo.'))
d.append(Spacer(1, 5 * mm))

d.append(Paragraph('Que le vas a preguntar el primer dia', H2))
d.append(Paragraph('Casi nada, porque ya esta todo cargado. Lo que si conviene mirar antes '
                   'de que entre: el <b>motivo de consulta</b> escrito con sus palabras, los '
                   '<b>antecedentes</b> (puede haber una cirugia que contraindique ejercicios '
                   'enteros) y sobre todo el <b>objetivo</b>.', P))
d.append(Paragraph('El objetivo es el campo mas importante de todos: es contra lo que se va '
                   'a medir si el tratamiento sirvio. "Volver a nadar 2000 metros sin dolor" '
                   'es un objetivo. "Estar mejor" no lo es.', P))

d.append(PageBreak())

# ── UN DIA DE TRABAJO ──────────────────────────────────────────────────
d.append(Paragraph('Un dia de trabajo', H1))
d.append(Paragraph('Esto es lo que vas a hacer quince veces por dia. Es un solo boton.', SUB))

d.append(Paragraph('Atender a alguien que llega', H2))
d.append(paso(1, 'Entra al Panel',
              'Ves los turnos del dia en orden. El que esta por venir dice <b>atender</b>.'))
d.append(paso(2, 'Toca el turno de esa persona',
              'Se abre una sola pantalla con todo lo de esa sesion. No hay que ir a ningun '
              'otro lado.'))
d.append(paso(3, 'Completa mientras atendes',
              'Si vino o falto. Que tipo de sesion fue. Cuanto le dolia al llegar y cuanto '
              'al terminar. Que se hizo, si queres anotarlo. Y de una vez, el proximo turno.'))
d.append(paso(4, 'Toca confirmar',
              'El boton te dice cuantas cosas va a hacer. En un solo toque: queda marcado '
              'que vino, se le descuenta la sesion del plan, se cobra si paga por sesion, '
              'se guarda en su ficha, se asienta en la historia clinica, y le queda el '
              'proximo turno reservado.'))

d.append(caja('<b>Los dos valores de dolor son obligatorios; la nota no.</b><br/><br/>'
              'La diferencia entre el dolor al llegar y al terminar es el dato que muestra '
              'si la sesion sirvio. Sin esos dos numeros el resto no dice nada.', VERDE, '#EAF4EE'))
d.append(Spacer(1, 5 * mm))

d.append(Paragraph('Si el paciente falta', H2))
d.append(Paragraph('Marca <b>Falto</b>. No se le descuenta la sesion ni se cobra, pero queda '
                   'contado en el porcentaje de ausencias del mes.', P))
d.append(Paragraph('Ese porcentaje es el numero que mas plata mueve en un estudio: cada '
                   'hueco es una hora que no se recupera. Lo ves en el Panel y en Caja.', P))

d.append(PageBreak())

# ── LESIONES Y FASES ───────────────────────────────────────────────────
d.append(Paragraph('Abrir una lesion', H1))
d.append(Paragraph('Es lo que convierte a alguien del padron en alguien en tratamiento.', SUB))

d.append(paso(1, 'Entra al paciente',
              'Desde <b>Pacientes</b>, tocalo y despues <b>Abrir una lesion</b>.'))
d.append(paso(2, 'Elegi zona, lado y gravedad',
              'Tobillo, rodilla, hombro, muslo, lumbar u otra. Y que tan grave es, de leve '
              'a grave.'))
d.append(paso(3, 'Lo demas se completa solo',
              'Los criterios de cada fase salen de la zona que elegiste. La fecha estimada '
              'de alta se calcula con la zona y la gravedad. Y el parte medico lo marca '
              'como de baja.<br/><br/>'
              'Todo eso lo podes corregir despues desde la ficha.'))

d.append(Paragraph('Las cinco fases', H2))
d.append(tabla(['Fase', 'Que se busca', 'Cancha'], [
    ['1  Proteccion', 'Bajar el dolor y proteger la zona', 'No'],
    ['2  Rango', 'Recuperar movilidad y fuerza', 'No'],
    ['3  Readaptacion', 'Fuerza especifica y aterrizajes', 'Gimnasio'],
    ['4  Reintegro', 'Volumen parcial, gesto tecnico', 'Parcial'],
    ['5  Alta', 'Competir sin restricciones', 'Si'],
], [34 * mm, 101 * mm, 30 * mm]))

d.append(Spacer(1, 6 * mm))
d.append(Paragraph('Por que el boton de avanzar esta apagado', H2))
d.append(Paragraph('Porque faltan criterios por cumplir. El boton se enciende solo cuando '
                   'estan todos tildados.', P))
d.append(Paragraph('No es un capricho del programa. La evidencia sobre retorno al juego '
                   'muestra que volver antes de tiempo aumenta mucho el riesgo de recaida, y '
                   'que el alta tiene que darse por criterios cumplidos y no por dias '
                   'transcurridos. La fecha estimada sirve para avisarle al entrenador, no '
                   'para decidir.', P))
d.append(Paragraph('Al pasar de fase, los criterios se vacian y aparecen los de la fase '
                   'nueva. Cada fase se gana de nuevo.', P))

d.append(caja('<b>Al llegar a la fase 5 la lesion se cierra sola.</b> El paciente pasa a '
              'figurar disponible en el parte medico, y la ficha queda guardada en su '
              'historial.', VERDE, '#EAF4EE'))

d.append(PageBreak())

# ── PROGRAMA ───────────────────────────────────────────────────────────
d.append(Paragraph('Cargar los ejercicios', H1))
d.append(Paragraph('Lo que el paciente hace en casa, con el video al lado.', SUB))

d.append(paso(1, 'Anda a Programas',
              'Elegi al paciente. Los que no tienen lesion abierta aparecen apagados: '
              'primero hay que abrirles una.'))
d.append(paso(2, 'Elegi la fase',
              'Cada fase tiene su programa. Podes dejar armada la proxima antes de que el '
              'paciente llegue a ella.'))
d.append(paso(3, 'Suma de la biblioteca',
              'Toca <b>Sumar de la biblioteca</b>. Los de la zona lesionada aparecen '
              'primero. Vienen con la dosis sugerida ya puesta.'))
d.append(paso(4, 'Ajusta la dosis',
              'Series, repeticiones y carga. Las repeticiones son texto libre a proposito: '
              'sirve tanto "12" como "30 seg" o "10 por lado".'))
d.append(paso(5, 'Pega el enlace del video',
              'Si tenes el ejercicio filmado. Funciona con YouTube, Vimeo o un archivo '
              'de video.'))
d.append(paso(6, 'Guarda',
              'En ese momento el paciente lo ve en su celular. No hay que avisarle nada.'))

d.append(caja('<b>Los videos no se guardan adentro del portal</b>, porque pesan demasiado. '
              'Se suben a YouTube o Vimeo y aca se pega el enlace.<br/><br/>'
              'Si vas a filmar tus propios ejercicios, en YouTube subilos como <b>ocultos</b>: '
              'no aparecen en las busquedas, pero funcionan con el enlace.'))

d.append(PageBreak())

# ── HISTORIA CLINICA ───────────────────────────────────────────────────
d.append(Paragraph('La historia clinica', H1))
d.append(Paragraph('Se escribe sola mientras trabajas. Es un documento legal.', SUB))

d.append(Paragraph('Que se asienta solo', H2))
d.append(Paragraph('Cada cosa que haces genera un asiento numerado, con fecha, hora y tu '
                   'nombre: el alta del paciente, el consentimiento, la apertura de la '
                   'lesion, cada sesion, cada criterio que tildas, cada cambio de fase y el '
                   'alta final.', P))
d.append(Paragraph('Vos no haces nada distinto. Se escribe mientras atendes.', P))

d.append(Paragraph('No se puede editar el pasado', H2))
d.append(Paragraph('Corregir algo no borra lo anterior: agrega una rectificacion que apunta '
                   'al asiento equivocado. Es como en papel, donde uno tacha y firma al lado '
                   'en vez de arrancar la hoja.', P))
d.append(Paragraph('Arriba de la historia hay un cartel que dice si esta integra. Si alguien '
                   'modificara un asiento viejo, el sistema lo detecta y lo avisa.', P))

d.append(Paragraph('El paciente puede pedirte una copia', H2))
d.append(Paragraph('Por ley el paciente es el titular de su historia clinica y podes tener '
                   'que darsela dentro de las 48 horas. En el portal es un boton: '
                   '<b>Descargar en PDF</b>. El paciente tambien la ve entera desde su '
                   'celular, en <b>Mi historia</b>.', P))

d.append(Paragraph('Quien vio que', H2))
d.append(Paragraph('Abajo de cada historia queda la lista de accesos: quien la abrio y '
                   'cuando. El paciente no ve esa lista.', P))

d.append(caja('<b>El cuerpo tecnico nunca ve el diagnostico.</b><br/><br/>'
              'Si el paciente es del plantel, el entrenador ve solamente si esta disponible, '
              'limitado o de baja, y para cuando vuelve. Nada mas. El diagnostico es un dato '
              'de salud y no lo necesita para armar el equipo.', AMBAR, '#FBF3E6'))

d.append(PageBreak())

# ── CAJA ───────────────────────────────────────────────────────────────
d.append(Paragraph('La plata', H1))
d.append(Paragraph('Planes, sesiones que quedan, lo que entra y lo que sale.', SUB))

d.append(Paragraph('Los planes', H2))
d.append(tabla(['Plan', 'Como funciona'], [
    ['Plantel del club', 'Lo cubre el club. No se factura por sesion.'],
    ['Sesion a sesion', 'Paga cada vez que viene. Se cobra al marcar que vino.'],
    ['Plan de 10', 'Diez sesiones. Se descuenta una por cada sesion atendida.'],
    ['Mensual libre', 'Todas las sesiones del mes, sin descontar.'],
    ['Asesoria online', 'Rutinas y seguimiento por la app, sin sesiones presenciales.'],
    ['Premium', 'App, sesiones libres y atencion personalizada.'],
], [40 * mm, 125 * mm]))

d.append(Spacer(1, 5 * mm))
d.append(caja('<b>La sesion se descuenta cuando marcas que vino, no cuando reserva.</b><br/><br/>'
              'Si se descontara al reservar, una cancelacion a tiempo le comeria una sesion '
              'al paciente y terminarias discutiendo por WhatsApp.', VERDE, '#EAF4EE'))
d.append(Spacer(1, 5 * mm))

d.append(Paragraph('Que se anota solo y que cargas vos', H2))
d.append(Paragraph('Se anotan solos: los planes que vendes y las sesiones sueltas que '
                   'atendes.', P))
d.append(Paragraph('Los cargas vos: los gastos. Alquiler, luz, insumos, equipamiento. Es un '
                   'concepto y un monto, en la pantalla de <b>Caja</b>.', P))

d.append(Paragraph('Quien se esta quedando sin sesiones', H2))
d.append(Paragraph('En Caja, en la lista de planes, los que tienen dos sesiones o menos '
                   'aparecen marcados en ambar, y los que no tienen ninguna en rojo. Conviene '
                   'avisarles antes de que lleguen a cero.', P))

d.append(PageBreak())

# ── EL PACIENTE ────────────────────────────────────────────────────────
d.append(Paragraph('Lo que ve el paciente', H1))
d.append(Paragraph('Conviene que lo sepas, porque te lo va a preguntar.', SUB))

d.append(Paragraph('El ve solo lo suyo. Nunca ve otros pacientes, ni la agenda completa, ni '
                   'la caja. En los turnos de otros ve la palabra "ocupado", nunca de quien '
                   'son.', P))

d.append(tabla(['Pantalla', 'Que hace ahi'], [
    ['Mi recuperacion', 'En que fase esta, que le falta para la siguiente,\ncuando es su turno, y sus ejercicios de hoy con video.'],
    ['Mis turnos', 'Reservar un horario libre. Te llega el aviso.'],
    ['Como estoy', 'Cinco preguntas diarias: sueño, cansancio, dolor\nmuscular, animo y estres. Medio minuto.'],
    ['Mi historia', 'Su historia clinica completa. La puede descargar.'],
], [36 * mm, 129 * mm]))

d.append(Spacer(1, 6 * mm))
d.append(Paragraph('Los ejercicios y el registro', H2))
d.append(Paragraph('El paciente tilda cada ejercicio a medida que lo hace, y al final marca '
                   'cuanto le dolio y que tan exigente le resulto. Eso te llega a vos.', P))
d.append(Paragraph('Es el dato que te dice si el estancamiento es del tratamiento o de que '
                   'no lo esta haciendo. Sin eso estas adivinando.', P))

d.append(Paragraph('Las cinco preguntas diarias', H2))
d.append(Paragraph('Se completan <b>despues</b> de entrenar, no antes. Si se cargan antes, '
                   'estan midiendo como amanecio, no como lo dejo el entrenamiento.', P))

d.append(PageBreak())

# ── PIZARRON Y REFERENCIA ──────────────────────────────────────────────
d.append(Paragraph('El pizarron de circuitos', H1))
d.append(Paragraph('Para los trabajos de campo, en la cancha.', SUB))

d.append(Paragraph('Elegi la cancha (entera, media, espacio reducido o gimnasio), toca un '
                   'elemento de la izquierda y despues toca la cancha para colocarlo. Con '
                   '<b>Mover</b> arrastras lo que ya esta puesto.', P))
d.append(Paragraph('Los recorridos se dibujan arrastrando de un punto a otro: <b>Correr</b> '
                   'es flecha derecha, <b>Conducir</b> es ondulada (con pelota) y <b>Pase</b> '
                   'es punteada.', P))
d.append(Paragraph('Despues numeras las postas y escribis que se hace en cada una. Se guarda '
                   'en la biblioteca y se puede sumar al programa de cualquier paciente.', P))
d.append(Paragraph('Anda mejor en la computadora que en el celular: dibujar un circuito con '
                   'el dedo es incomodo. En el celular sirve para consultarlo.', CHICO))

d.append(PageBreak())

# ── HOJA DE REFERENCIA ─────────────────────────────────────────────────
d.append(Paragraph('Para tener a mano', H1))
d.append(Paragraph('Las respuestas a lo que mas se pregunta.', SUB))

d.append(tabla(['Quiero...', 'Anda a...'], [
    ['Atender a alguien que llego', 'Panel, toca su turno. Se hace todo ahi.'],
    ['Sumar un paciente nuevo', 'No lo cargues. Que escanee el QR del Cartel.'],
    ['Darle turno a alguien', 'Agenda, toca un horario libre.'],
    ['Cambiarle los ejercicios', 'Programas, elegilo, cambia y guarda.'],
    ['Ver como viene alguien', 'Lesiones, abri su ficha.'],
    ['Darle el alta', 'Lesiones, tilda los criterios de la fase 5.'],
    ['Venderle un plan', 'Caja, boton Cambiar plan.'],
    ['Anotar un gasto', 'Caja, columna de la derecha.'],
    ['Darle su historia clinica', 'Historias, elegilo, Descargar en PDF.'],
    ['Saber cuanto gane este mes', 'Panel, arriba de todo.'],
    ['Entender una pantalla', 'El boton con el signo de pregunta, arriba.'],
], [58 * mm, 107 * mm]))

d.append(Spacer(1, 8 * mm))
d.append(Paragraph('Las tres cosas que no hay que olvidarse', H2))
d.append(caja('<b>Uno.</b> Vaciar los pacientes de prueba antes de cargar el primero de '
              'verdad. Mi perfil, abajo de todo.<br/><br/>'
              '<b>Dos.</b> Los dos valores de dolor en cada sesion. La diferencia entre '
              'ellos es el dato que sirve.<br/><br/>'
              '<b>Tres.</b> El objetivo del paciente, escrito con sus palabras. Es contra '
              'lo que se mide si el tratamiento funciono.', AMBAR, '#FBF3E6'))

d.append(Spacer(1, 8 * mm))
d.append(Paragraph('Si algo no se entiende o falta algo, anotalo y decilo. El portal se '
                   'sigue armando: lo que no sirve se cambia.', CHICO))

doc = SimpleDocTemplate('COMO_SE_USA.pdf', pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Como se usa el portal',
                        author='Portal de kinesiologia')
doc.build(d, onFirstPage=pie, onLaterPages=pie)
print('PDF listo')
