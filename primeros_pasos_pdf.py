#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Arma el instructivo de primer uso, para el kinesiologo."""

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

DIRECCION = 'estudio-kine.vercel.app'

TINTA = colors.HexColor('#0F1922')
GRIS  = colors.HexColor('#546372')
AZUL  = colors.HexColor('#0E7C8A')
VERDE = colors.HexColor('#2E7D4F')
AMBAR = colors.HexColor('#8A5A11')
ROJO  = colors.HexColor('#AE3226')
SUAVE = colors.HexColor('#EEF3F5')
LINEA = colors.HexColor('#C3CCD6')

H1  = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=23, leading=27, textColor=TINTA, spaceAfter=4)
SUB = ParagraphStyle('SUB', fontName='Helvetica', fontSize=11.5, leading=16, textColor=GRIS, spaceAfter=14)
H2  = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=AZUL, spaceBefore=15, spaceAfter=7)
P   = ParagraphStyle('P', fontName='Helvetica', fontSize=10.8, leading=15.5, textColor=TINTA, spaceAfter=7)
PASO = ParagraphStyle('PASO', fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=TINTA, spaceAfter=3)
CHICO = ParagraphStyle('CHICO', fontName='Helvetica', fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=5)
MONO = ParagraphStyle('MONO', fontName='Courier-Bold', fontSize=13, leading=18, textColor=AZUL, spaceAfter=6)


def caja(txt, color=AZUL, fondo='#E9F4F6'):
    t = Table([[Paragraph(txt, ParagraphStyle('a', fontName='Helvetica', fontSize=10.3,
                leading=14.5, textColor=color))]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(fondo)),
        ('BOX', (0, 0), (-1, -1), 0.8, color),
        ('LEFTPADDING', (0, 0), (-1, -1), 11), ('RIGHTPADDING', (0, 0), (-1, -1), 11),
        ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
    return t


def direccion_grande():
    dentro = [Paragraph('LA DIRECCION DEL PORTAL', ParagraphStyle('t', fontName='Helvetica-Bold',
                fontSize=9, textColor=colors.white, alignment=1, spaceAfter=6)),
              Paragraph(DIRECCION, ParagraphStyle('d', fontName='Courier-Bold', fontSize=19,
                leading=26, textColor=colors.white, alignment=1, spaceAfter=8)),
              Paragraph('Escribila en la barra de arriba del navegador, tal cual, sin www.',
                ParagraphStyle('p', fontName='Helvetica', fontSize=9.5, leading=13,
                textColor=colors.HexColor('#BFE4EA'), alignment=1))]
    t = Table([[dentro]], colWidths=[165 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), AZUL),
        ('LEFTPADDING', (0, 0), (-1, -1), 14), ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 13), ('BOTTOMPADDING', (0, 0), (-1, -1), 13)]))
    return t


def paso(n, titulo, cuerpo, extra=None):
    izq = Table([[Paragraph(str(n), ParagraphStyle('n', fontName='Helvetica-Bold',
                 fontSize=16, textColor=colors.white, alignment=1))]],
                colWidths=[10 * mm], rowHeights=[10 * mm])
    izq.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), AZUL),
                             ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    der = [Paragraph(titulo, PASO), Paragraph(cuerpo, P)]
    if extra: der.append(extra)
    t = Table([[izq, der]], colWidths=[14 * mm, 151 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (0, 0), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
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
    canvas.drawString(22 * mm, 12 * mm, 'Portal de kinesiologia — primeros pasos')
    canvas.drawRightString(188 * mm, 12 * mm, 'Pagina %d' % doc.page)
    canvas.setStrokeColor(LINEA)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


d = []

# ── 1. EMPEZAR ────────────────────────────────────────────────────────
d.append(Paragraph('Tu portal: primeros pasos', H1))
d.append(Paragraph('Todo lo que hay que hacer la primera vez, en orden. Despues de esto, '
                   'el uso diario son dos o tres toques.', SUB))

d.append(direccion_grande())
d.append(Spacer(1, 6 * mm))

d.append(caja('<b>No tenes que instalar nada.</b><br/><br/>'
              'El portal se abre en el navegador, igual que cualquier pagina. Anda en la '
              'computadora, en el celular y en la tablet.'))
d.append(Spacer(1, 4 * mm))
d.append(caja('<b>Antes de empezar a cargar pacientes de verdad, leé esto.</b><br/><br/>'
              'Hoy cada aparato guarda lo suyo: si cargas un paciente en la computadora, todavia '
              'no lo vas a ver en el celular. Falta conectar la base de datos, que es un paso que '
              'hace Nacho una sola vez y va a tu nombre.<br/><br/>'
              'Mientras tanto podes recorrer todo el portal y probarlo, pero <b>usá siempre el '
              'mismo aparato</b> hasta que te avise que ya esta conectada.', AMBAR, '#FBF3E6'))
d.append(Spacer(1, 5 * mm))

d.append(Paragraph('Paso 1 — Entrar por primera vez', H2))
d.append(paso(1, 'Abri la direccion',
              'Escribila en la barra de arriba del navegador y apreta Enter.'))
d.append(paso(2, 'Elegi "Soy el kinesiologo"',
              'Son dos botones. El de la izquierda es para los pacientes; el de la derecha, '
              'para vos.'))
d.append(paso(3, 'Entra con estos datos',
              'Son los que vienen puestos de fabrica. En el paso 2 los vas a cambiar por los tuyos.',
              Paragraph('vero@estudiokine.com<br/>estudio', MONO)))

d.append(caja('<b>Cambia esa contraseña hoy mismo.</b> Es la que trae el portal de fabrica y '
              'la conoce cualquiera que lea este papel. En el paso siguiente se cambia.',
              ROJO, '#FBEDEB'))

d.append(PageBreak())

# ── 2. TU PERFIL ──────────────────────────────────────────────────────
d.append(Paragraph('Paso 2 — Cargar tus datos', H1))
d.append(Paragraph('Anda a <b>Mi perfil</b> en el menu.', SUB))

d.append(paso(1, 'Tu correo y tu contraseña',
              'Son los que vas a usar para entrar de ahora en mas. Poné un correo que uses y '
              'una contraseña que te acuerdes. <b>Guardalas en algun lado</b>: si las perdes, '
              'hay que pedir ayuda para recuperarlas.'))
d.append(paso(2, 'Tu nombre y tu matricula',
              'La matricula sale impresa en la historia clinica de cada paciente, que es un '
              'documento profesional.'))
d.append(paso(3, 'Tu foto y el logo del estudio',
              'La foto la ve el paciente cuando entra. El logo sale en el cartel del codigo QR '
              'y en la pantalla de entrada.'))
d.append(paso(4, 'El telefono',
              'Es al que te llegan los avisos por WhatsApp cuando alguien reserva un turno. '
              'Si lo dejas vacio, ese boton no funciona.'))

d.append(Paragraph('Paso 3 — Borrar los pacientes de prueba', H2))
d.append(caja('<b>Esto es lo mas importante de toda la guia.</b><br/><br/>'
              'El portal viene con pacientes inventados para que se vea funcionando: Marcela '
              'Rios, Diego Sosa y algunos mas. <b>No existen.</b><br/><br/>'
              'En la misma pantalla de Mi perfil, abajo de todo, hay un boton para vaciar. Te '
              'pide escribir la palabra VACIAR.<br/><br/>'
              '<b>Haceló antes de cargar tu primer paciente de verdad.</b> Si no, dentro de un '
              'mes no vas a saber cual es real y cual inventado. En una historia clinica eso no '
              'se puede permitir.<br/><br/>'
              'No se borran ni tus horarios, ni tu perfil, ni la biblioteca de ejercicios, ni '
              'las plantillas de lesion: eso es la herramienta, no los datos.',
              ROJO, '#FBEDEB'))

d.append(PageBreak())

# ── 3. HORARIOS ───────────────────────────────────────────────────────
d.append(Paragraph('Paso 4 — Cargar tus horarios', H1))
d.append(Paragraph('Anda a <b>Horarios</b> en el menu. Es lo que define TODOS los turnos.', SUB))

d.append(Paragraph('Como funciona', H2))
d.append(Paragraph('No hay que crear los turnos ni los meses. Vos decis cuando atendes, y el '
                   'portal genera solo los horarios de todos los dias, de todos los meses, '
                   'para siempre. Podes dar un turno para dentro de seis meses sin haber '
                   'hecho nada antes.', P))

d.append(paso(1, 'Cuanto dura cada turno',
              'Arriba de todo: 20, 30, 40, 45 o 60 minutos. Cambiarlo recalcula la agenda entera.'))
d.append(paso(2, 'Tu semana, dia por dia',
              'Cada dia tiene sus franjas. Podes poner mañana y tarde por separado: por ejemplo '
              'lunes de 8:30 a 12:30 y de 16 a 20, y martes solo a la mañana.<br/><br/>'
              'El boton <b>+ Otra franja</b> agrega la segunda. El <b>+ Abrir este dia</b> '
              'enciende un dia que estaba cerrado.'))
d.append(paso(3, 'Los dias que no atendes',
              'Abajo: feriados, vacaciones, un congreso. Cierran ese dia puntual aunque sea dia '
              'de atencion.'))
d.append(paso(4, 'Guardar',
              'Arriba te dice cuantos turnos por semana genera tu horario. Sirve para darte '
              'cuenta si te quedo algo mal cargado.'))

d.append(caja('Si cambias los horarios mas adelante, los turnos que ya diste <b>no se borran</b>. '
              'Si alguno quedo fuera del horario nuevo, lo vas a ver marcado en la agenda.',
              VERDE, '#EAF4EE'))

d.append(PageBreak())

# ── 4. PACIENTES ──────────────────────────────────────────────────────
d.append(Paragraph('Paso 5 — Sumar tus primeros pacientes', H1))
d.append(Paragraph('Hay dos formas, y una es mucho mejor que la otra.', SUB))

d.append(Paragraph('La buena: que lo cargue el paciente', H2))
d.append(Paragraph('Anda a <b>Cartel</b> en el menu y toca <b>Imprimir el cartel</b>. Sale en '
                   'una hoja, en blanco y negro. Pegalo donde entra la gente.', P))
d.append(Paragraph('El paciente apunta la camara del celular al codigo, completa sus datos en '
                   'dos minutos y aparece solo en tu lista. <b>Vos no tipeas nada y no hay '
                   'errores de dictado.</b>', P))
d.append(Paragraph('Si no tenes el cartel a mano, en <b>Pacientes</b> hay botones para mandarle '
                   'el enlace por WhatsApp.', P))

d.append(Paragraph('La otra: cargarlo vos', H2))
d.append(Paragraph('En <b>Pacientes</b>, arriba, el boton <b>+ Nuevo paciente</b> abre la misma '
                   'ficha para que la completes con la persona adelante.', P))

d.append(Paragraph('Que se le pregunta', H2))
d.append(tabla(['Dato', 'Para que sirve'], [
    ['Nombre, documento, nacimiento', 'El documento y la fecha son con lo que despues entra.'],
    ['Telefono y correo', 'Para el aviso del turno.'],
    ['Motivo de consulta', 'Con sus palabras, no con las tuyas.'],
    ['De que trabaja', 'No es lo mismo un dolor lumbar en alguien\nque pasa ocho horas sentado que en un jugador.'],
    ['Que deporte hace y con que frecuencia', 'Cambia el tratamiento y los criterios de alta.'],
    ['Cirugias y lesiones anteriores', 'Pueden contraindicar ejercicios enteros.'],
    ['Que quiere volver a poder hacer', 'El campo mas importante. Ver abajo.'],
], [58 * mm, 107 * mm]))

d.append(Spacer(1, 5 * mm))
d.append(caja('<b>El objetivo del paciente es el campo que mas importa.</b><br/><br/>'
              '"Volver a nadar 2000 metros sin dolor" es un objetivo. "Estar mejor" no lo es.<br/><br/>'
              'Es contra lo que se va a medir si el tratamiento sirvio, y es lo que le vas a '
              'poder mostrar el dia del alta.', AMBAR, '#FBF3E6'))

d.append(PageBreak())

# ── 5. COMO ENTRA EL PACIENTE ─────────────────────────────────────────
d.append(Paragraph('Como entra el paciente', H1))
d.append(Paragraph('Te lo van a preguntar, asi que conviene que lo sepas.', SUB))

d.append(Paragraph('Con su documento y su fecha de nacimiento. <b>No tiene contraseña.</b>', P))
d.append(Paragraph('Es a proposito: si le pedimos crear una contraseña, la mitad no vuelve a '
                   'entrar nunca. La olvida y no llama para recuperarla. Documento y fecha de '
                   'nacimiento son dos datos que nadie olvida.', P))

d.append(caja('<b>Su limite, dicho claro.</b><br/><br/>'
              'No es tan fuerte como una contraseña: alguien que sepa el documento Y la fecha '
              'de nacimiento de un paciente podria ver su ficha.<br/><br/>'
              'Para compensar, cada paciente ve <b>solo lo suyo</b>: nunca la lista de pacientes, '
              'ni la agenda completa, ni la caja. Y cada ingreso queda registrado.<br/><br/>'
              'Si preferis exigir contraseña, se puede cambiar. Deciselo a Nacho.', AMBAR, '#FBF3E6'))

d.append(Spacer(1, 5 * mm))
d.append(Paragraph('Que ve el paciente', H2))
d.append(tabla(['Pantalla', 'Que hace ahi'], [
    ['Mi recuperacion', 'En que fase esta, que le falta, su turno,\ny sus ejercicios de hoy con video.'],
    ['Mis turnos', 'Elegir un dia en el calendario y reservar.\nConfirmar o avisar que no puede ir.'],
    ['Como estoy', 'Cinco preguntas diarias. Medio minuto.'],
    ['Mi historia', 'Su historia clinica completa. La puede descargar.'],
], [36 * mm, 129 * mm]))

d.append(PageBreak())

# ── 6. EL DIA A DIA ───────────────────────────────────────────────────
d.append(Paragraph('El dia a dia', H1))
d.append(Paragraph('Una vez cargado todo, esto es lo unico que vas a hacer.', SUB))

d.append(Paragraph('Atender a alguien que llega', H2))
d.append(Paragraph('Entra al <b>Panel</b> y toca el turno de esa persona. Se abre todo en una '
                   'sola pantalla: si vino, cuanto le dolia al llegar y al terminar, que se hizo, '
                   'y el proximo turno.', P))
d.append(Paragraph('Un solo boton al final hace todo junto: marca la asistencia, descuenta la '
                   'sesion del plan, cobra si paga por sesion, guarda la sesion en su ficha, lo '
                   'asienta en la historia clinica y deja reservado el proximo turno.', P))

d.append(Paragraph('Lo primero que vas a ver cada mañana', H2))
d.append(Paragraph('Arriba del Panel hay una lista de avisos. Cruza sola el dolor de las sesiones, '
                   'los ejercicios que hizo en casa y los mensajes sin responder.', P))
d.append(tabla(['Cuando salta', 'Que hacer'], [
    ['El dolor le sube tres sesiones seguidas', 'Bajarle la carga antes de seguir.'],
    ['Hizo menos de la mitad de sus ejercicios', 'Preguntarle por que.'],
    ['Hace cinco dias que no registra nada', 'Escribirle antes de que abandone.'],
    ['Cumplio todos los criterios de la fase', 'Pasarlo a la siguiente.'],
    ['Te escribio y no le respondiste', 'Responderle.'],
], [80 * mm, 85 * mm]))

d.append(Spacer(1, 5 * mm))
d.append(Paragraph('Reservar un plan entero', H2))
d.append(Paragraph('En <b>Agenda</b>, boton <b>Reservar una serie</b>: elegis el paciente, los '
                   'dias de la semana y la hora, y se reservan las diez sesiones de una. Si alguna '
                   'fecha esta ocupada la saltea y te avisa.', P))

d.append(PageBreak())

# ── 7. PARA PEGAR ─────────────────────────────────────────────────────
d.append(Paragraph('Para tener a mano', H1))
d.append(Paragraph('Lo unico que hay que recordar todos los dias.', SUB))
d.append(direccion_grande())
d.append(Spacer(1, 8 * mm))

d.append(tabla(['Quiero...', 'Anda a...'], [
    ['Atender a alguien que llego', 'Panel, toca su turno.'],
    ['Sumar un paciente nuevo', 'Que escanee el QR del Cartel.'],
    ['Dar un turno', 'Agenda, elegi el dia y toca un horario libre.'],
    ['Reservar un plan de 10', 'Agenda, boton Reservar una serie.'],
    ['Cambiar mis horarios', 'Horarios.'],
    ['Cambiarle los ejercicios', 'Programas.'],
    ['Ver como viene alguien', 'Lesiones, abri su ficha.'],
    ['Darle el alta', 'Lesiones, tilda los criterios de la fase 5.'],
    ['Venderle un plan', 'Caja, boton Cambiar plan.'],
    ['Anotar un gasto', 'Caja.'],
    ['Darle su historia clinica', 'Historias, Descargar en PDF.'],
    ['Entender una pantalla', 'El boton con el signo de pregunta, arriba.'],
], [58 * mm, 107 * mm]))

d.append(Spacer(1, 8 * mm))
d.append(Paragraph('Las cuatro cosas que no hay que olvidarse', H2))
d.append(caja('<b>Uno.</b> Cambiar la contraseña de fabrica.<br/><br/>'
              '<b>Dos.</b> Vaciar los pacientes de prueba antes de cargar el primero de verdad.<br/><br/>'
              '<b>Tres.</b> Los dos valores de dolor en cada sesion: la diferencia entre ellos '
              'es el dato que sirve.<br/><br/>'
              '<b>Cuatro.</b> El objetivo del paciente, escrito con sus palabras.',
              AMBAR, '#FBF3E6'))

d.append(Spacer(1, 8 * mm))
d.append(Paragraph('Si algo no se entiende, no anda o falta algo: anotalo y decilo. El portal '
                   'se sigue armando, y lo que no sirve se cambia.', CHICO))

doc = SimpleDocTemplate('PRIMEROS_PASOS.pdf', pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Tu portal: primeros pasos',
                        author='Portal de kinesiologia')
doc.build(d, onFirstPage=pie, onLaterPages=pie)
print('PDF listo')
