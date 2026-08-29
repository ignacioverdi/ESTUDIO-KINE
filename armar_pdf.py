#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Arma la guia en PDF para instalar el portal desde cero."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether)

TINTA  = colors.HexColor('#0F1922')
GRIS   = colors.HexColor('#546372')
AZUL   = colors.HexColor('#0E7C8A')
VERDE  = colors.HexColor('#2E7D4F')
ROJO   = colors.HexColor('#AE3226')
SUAVE  = colors.HexColor('#EEF3F5')
LINEA  = colors.HexColor('#C3CCD6')

H1 = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=24, leading=28,
                    textColor=TINTA, spaceAfter=4)
SUB = ParagraphStyle('SUB', fontName='Helvetica', fontSize=11.5, leading=16,
                     textColor=GRIS, spaceAfter=16)
H2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=15, leading=19,
                    textColor=AZUL, spaceBefore=16, spaceAfter=7)
P = ParagraphStyle('P', fontName='Helvetica', fontSize=11, leading=16,
                   textColor=TINTA, spaceAfter=7)
CHICO = ParagraphStyle('CHICO', fontName='Helvetica', fontSize=9.5, leading=13,
                       textColor=GRIS, spaceAfter=5)
PASO = ParagraphStyle('PASO', fontName='Helvetica-Bold', fontSize=12.5, leading=16,
                      textColor=TINTA, spaceAfter=3)
MONO = ParagraphStyle('MONO', fontName='Courier-Bold', fontSize=11, leading=15,
                      textColor=TINTA, spaceAfter=6, leftIndent=6)


def aviso(txt, color=ROJO, fondo='#FBEDEB'):
    t = Table([[Paragraph(txt, ParagraphStyle('a', fontName='Helvetica', fontSize=10.5,
                leading=15, textColor=color))]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(fondo)),
        ('BOX', (0, 0), (-1, -1), 0.8, color),
        ('LEFTPADDING', (0, 0), (-1, -1), 11), ('RIGHTPADDING', (0, 0), (-1, -1), 11),
        ('TOPPADDING', (0, 0), (-1, -1), 9),   ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
    return t


def recuadro_direccion():
    """La direccion del portal, imposible de no ver."""
    dentro = [Paragraph('LA DIRECCION DEL PORTAL', ParagraphStyle('t',
                fontName='Helvetica-Bold', fontSize=9, textColor=colors.white,
                alignment=1, spaceAfter=6)),
              Paragraph(DIRECCION, ParagraphStyle('d', fontName='Courier-Bold',
                fontSize=19, leading=26, textColor=colors.white, alignment=1,
                spaceAfter=9)),
              Paragraph('Escribila en la barra de arriba del navegador, tal cual, '
                        'sin www y sin nada mas.', ParagraphStyle('p',
                fontName='Helvetica', fontSize=9.5, leading=13,
                textColor=colors.HexColor('#BFE4EA'), alignment=1))]
    t = Table([[dentro]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), AZUL),
        ('LEFTPADDING', (0, 0), (-1, -1), 14), ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 13),  ('BOTTOMPADDING', (0, 0), (-1, -1), 13)]))
    return t


def paso(n, titulo, cuerpo, extra=None):
    izq = Table([[Paragraph(str(n), ParagraphStyle('n', fontName='Helvetica-Bold',
                 fontSize=17, textColor=colors.white, alignment=1))]],
                colWidths=[11 * mm], rowHeights=[11 * mm])
    izq.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), AZUL),
                             ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    der = [Paragraph(titulo, PASO), Paragraph(cuerpo, P)]
    if extra:
        der.append(extra)
    t = Table([[izq, der]], colWidths=[15 * mm, 150 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('LEFTPADDING', (0, 0), (0, 0), 0),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 10)]))
    return KeepTogether(t)


def pie(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm, 'Portal de kinesiologia — guia de instalacion')
    canvas.drawRightString(188 * mm, 12 * mm, 'Pagina %d' % doc.page)
    canvas.setStrokeColor(LINEA)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ══════════════════════════════════════════════════════════════════════
# LA DIRECCION DEL PORTAL
# Es el dato mas importante de toda la guia: sin esto no puede ni entrar.
# Si el portal se publica en otra direccion, se cambia aca y se vuelve a
# generar el PDF con:   python armar_pdf.py
# ══════════════════════════════════════════════════════════════════════
DIRECCION = 'estudio-kine.vercel.app'

GRANDE = ParagraphStyle('GRANDE', fontName='Courier-Bold', fontSize=17, leading=25,
                        textColor=AZUL, spaceAfter=8, spaceBefore=4)

d = []

d.append(Paragraph('Instalar el portal en tu computadora', H1))
d.append(Paragraph('Guia paso a paso. Sirve para una computadora en blanco, '
                   'sin nada instalado. Cada paso dice como darte cuenta de que '
                   'salio bien.', SUB))

d.append(aviso('<b>Antes de empezar, lo mas importante.</b><br/><br/>'
               'Si solo queres <b>USAR</b> el portal para atender pacientes, '
               '<b>no necesitas instalar nada de esto</b>. Abri la direccion del '
               'portal en el navegador y listo. Anda en la computadora y en el celular.<br/><br/>'
               'Todo lo que sigue es para <b>MODIFICAR</b> el portal: cambiar textos, '
               'agregar cosas, publicar cambios.', AZUL, '#E9F4F6'))

d.append(Spacer(1, 5 * mm))
d.append(recuadro_direccion())
d.append(Spacer(1, 4 * mm))
d.append(Paragraph('Antes que nada: el atajo', H2))
d.append(Paragraph('Si lo unico que queres es entrar al portal todos los dias, '
                   'segui estos tres pasos y saltea el resto de la guia.', P))
d.append(paso(1, 'Abri el navegador',
              'Chrome, Edge o el que uses. Arriba de todo hay una barra ancha y vacia. '
              'Hace clic ahi, escribi esto tal cual y apreta la tecla Enter:',
              Paragraph(DIRECCION, GRANDE)))
d.append(paso(2, 'Instalalo como aplicacion',
              'En la computadora: en Chrome, arriba a la derecha hay tres puntitos. '
              'Tocalos y buscá <b>Instalar</b>.<br/>'
              'En el celular Android: aparece un cartel solo. Si no aparece, menu y '
              '<b>Instalar app</b>.<br/>'
              'En iPhone: el boton de <b>Compartir</b> y despues <b>Agregar a inicio</b>.'))
d.append(paso(3, 'Listo',
              'Te queda un icono. Lo tocas y se abre el portal sin la barra del navegador, '
              'como cualquier aplicacion. Funciona aunque te quedes sin internet.'))

d.append(PageBreak())

d.append(Paragraph('Instalar las herramientas', H1))
d.append(Paragraph('Esto es para modificar el portal. Son tres programas y se instalan '
                   'una sola vez.', SUB))

d.append(Paragraph('Paso 1 — Python', H2))
d.append(Paragraph('Es un programa que hace funcionar las herramientas del proyecto.', P))
d.append(paso(1, 'Entra a la pagina de descarga',
              'Escribi en el navegador:', Paragraph('python.org/downloads', MONO)))
d.append(paso(2, 'Baja el instalador',
              'Hay un boton amarillo grande que dice <b>Download Python</b>. Tocalo. '
              'Se baja un archivo. Cuando termine, hacele doble clic.'))
d.append(paso(3, 'ESTE PASO ES EL MAS IMPORTANTE DE TODA LA GUIA',
              'En la primera pantalla del instalador, <b>abajo de todo</b>, hay una '
              'casilla chiquita que dice <b>Add python.exe to PATH</b>.<br/><br/>'
              '<b>Tildala antes de seguir.</b> Es facilisimo pasarla por alto y si no la '
              'tildas, nada va a funcionar despues. Recien ahi toca <b>Install Now</b>.'))
d.append(aviso('<b>Como saber si salio bien:</b> apreta la tecla de Windows, escribi '
               '<b>cmd</b> y dale Enter. Se abre una ventana negra. Escribi ahi:<br/><br/>'
               '<font face="Courier-Bold">python --version</font><br/><br/>'
               'Tiene que contestar algo como <b>Python 3.13.1</b>. Si dice que no reconoce '
               'el comando, volve a instalar tildando la casilla.', VERDE, '#EAF4EE'))

d.append(PageBreak())

d.append(Paragraph('Paso 2 — Git', H2))
d.append(Paragraph('Guarda el historial de los cambios y permite publicarlos.', P))
d.append(paso(1, 'Entra a la pagina',
              'Escribi en el navegador:', Paragraph('git-scm.com/download/win', MONO)))
d.append(paso(2, 'Baja e instala',
              'La descarga arranca sola. Hacele doble clic al archivo.'))
d.append(paso(3, 'Dale siguiente a todo',
              'No cambies ninguna opcion. Las que vienen puestas estan bien. '
              'Siguiente, siguiente, hasta el final.'))
d.append(aviso('<b>Como saber si salio bien:</b> en la ventana negra escribi<br/><br/>'
               '<font face="Courier-Bold">git --version</font><br/><br/>'
               'Tiene que contestar un numero.', VERDE, '#EAF4EE'))

d.append(Paragraph('Paso 3 — Visual Studio Code', H2))
d.append(Paragraph('Es donde vas a ver y editar los archivos. Es gratis.', P))
d.append(paso(1, 'Entra a la pagina',
              'Escribi en el navegador:', Paragraph('code.visualstudio.com', MONO)))
d.append(paso(2, 'Baja e instala',
              'Boton azul grande. Doble clic al archivo que se baja.'))
d.append(paso(3, 'Tilda estas dos casillas',
              'Cerca del final del instalador aparecen unas casillas. Tilda las dos que '
              'dicen <b>Abrir con Code</b>. Te van a servir para abrir la carpeta del '
              'proyecto con el boton derecho del mouse.'))

d.append(PageBreak())

d.append(Paragraph('Poner el proyecto en la computadora', H1))
d.append(Paragraph('Ahora que estan las herramientas, va el proyecto.', SUB))

d.append(paso(1, 'Crea la carpeta',
              'Abri el explorador de archivos. En el disco C, crea una carpeta que se '
              'llame <b>Proyectos</b>, y adentro otra que se llame <b>ESTUDIO</b>. '
              'Te tiene que quedar asi:',
              Paragraph('C:\\Proyectos\\ESTUDIO', MONO)))
d.append(paso(2, 'Descomprimi el kit ahi',
              'El archivo que te pasaron termina en <b>.zip</b>. Hacele clic con el boton '
              '<b>derecho</b> del mouse y elegi <b>Extraer todo</b>, y despues '
              '<b>Extraer</b>.<br/><br/>'
              'Se abre una carpeta. Adentro hay otra carpeta llamada '
              '<b>kit</b>. Hacele doble clic para entrar.<br/><br/>'
              'Adentro vas a ver muchos archivos. Para copiarlos todos de una:<br/>'
              '&nbsp;&nbsp;&bull; Manten apretada la tecla <b>Ctrl</b> y toca la letra '
              '<b>A</b>. Se marcan todos de color.<br/>'
              '&nbsp;&nbsp;&bull; Con <b>Ctrl</b> apretada, toca la letra <b>C</b>. Eso copia.<br/>'
              '&nbsp;&nbsp;&bull; Anda a la carpeta ESTUDIO que creaste, y con <b>Ctrl</b> '
              'apretada toca la letra <b>V</b>. Eso pega.<br/><br/>'
              'La tecla Ctrl esta abajo a la izquierda del teclado.'))
d.append(aviso('<b>Cuidado con esto.</b> Los archivos van dentro de ESTUDIO, sueltos. '
               'Si te queda una carpeta llamada "kit" adentro de ESTUDIO, entraste mal: '
               'sacale los archivos de adentro y borra la carpeta vacia.<br/><br/>'
               'Tampoco lo dejes en la carpeta Descargas: Windows a veces bloquea archivos '
               'ahi y despues no anda y no se entiende por que.'))
d.append(paso(3, 'Abrilo',
              'Dentro de ESTUDIO vas a ver un archivo que se llama <b>ABRIR</b>. '
              'Hacele doble clic.<br/><br/>'
              'Se abre el navegador con el portal. La ventana negra que aparezca se cierra '
              'sola: no la toques.'))
d.append(aviso('<b>Como saber si salio bien:</b> tenes que ver una pantalla de fondo casi '
               'negro, con el titulo en letras grandes y celestes, y un cartel amarillo '
               'arriba avisando que los datos son de prueba.', VERDE, '#EAF4EE'))

d.append(PageBreak())

d.append(Paragraph('Los archivos que vas a usar', H1))
d.append(Paragraph('Dentro de la carpeta hay muchos archivos. Solo tres se tocan.', SUB))

filas = [
    ['Archivo', 'Cuando se usa'],
    ['ABRIR', 'Todos los dias. Abre el portal.\nSe cierra solo, no deja ventanas.'],
    ['PUBLICAR', 'Cuando queres que los cambios se vean\nen internet. Te pregunta antes de subir.'],
    ['CREAR_ACCESO_DIRECTO', 'Una sola vez. Te deja el icono del portal\nen el escritorio.'],
]
t = Table(filas, colWidths=[58 * mm, 107 * mm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), AZUL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 1), (0, -1), 'Courier-Bold'),
    ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, LINEA),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SUAVE]),
    ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('LEFTPADDING', (0, 0), (-1, -1), 9)]))
d.append(t)
d.append(Spacer(1, 8 * mm))

d.append(Paragraph('Lo primero que hay que hacer', H2))
d.append(aviso('<b>El portal viene con pacientes inventados</b> para que se vea funcionando. '
               'Marcela Rios y Diego Sosa no existen.<br/><br/>'
               '<b>Antes de cargar tu primer paciente de verdad</b>, entra a la seccion '
               '<b>Mi perfil</b>, anda hasta abajo de todo y usa el boton para vaciar. '
               'Te va a pedir escribir la palabra VACIAR.<br/><br/>'
               'Si no lo haces, dentro de un mes no vas a saber cual paciente es real y cual '
               'inventado. En una historia clinica eso no se puede permitir.'))

d.append(Paragraph('Si algo no anda', H2))

problemas = [
    ['"python no se reconoce como un comando"',
     'No tildaste la casilla Add python.exe to PATH.\nVolve a instalar Python tildandola.'],
    ['Se ve todo blanco y sin colores',
     'Los archivos quedaron sueltos o incompletos.\nDescomprimi todo el kit de nuevo, junto.'],
    ['No se ve el cambio que hice',
     'Cerra el navegador, abrilo de nuevo y volve\na tocar ABRIR.'],
    ['git rechaza la contrasena',
     'GitHub ya no acepta la contrasena comun.\nHay que generar un token. Pedi ayuda con esto.'],
]
t2 = Table([['Que ves', 'Que hacer']] + problemas, colWidths=[72 * mm, 93 * mm])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), ROJO),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 9.5),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, LINEA),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SUAVE]),
    ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('LEFTPADDING', (0, 0), (-1, -1), 9)]))
d.append(t2)

d.append(Spacer(1, 10 * mm))
d.append(Paragraph('Si algo no sale como dice la guia, no sigas adelante probando cosas: '
                   'sacale una foto a la pantalla y preguntá. Es mas rapido y no se rompe nada.',
                   CHICO))

d.append(PageBreak())

d.append(Paragraph('Para pegar en la pared', H1))
d.append(Paragraph('Lo unico que necesitas recordar todos los dias.', SUB))
d.append(Spacer(1, 6 * mm))
d.append(recuadro_direccion())
d.append(Spacer(1, 10 * mm))

d.append(Paragraph('Para atender pacientes', H2))
d.append(Paragraph('Toca el icono del portal. Nada mas. No hace falta abrir ningun otro '
                   'programa ni ninguna ventana negra.', P))
d.append(Spacer(1, 6 * mm))

d.append(Paragraph('Para atender a alguien que llega', H2))
d.append(Paragraph('Entra a <b>Panel</b>, toca el turno de esa persona, y se abre todo en '
                   'una sola pantalla: si vino, cuanto le dolia al llegar y al terminar, '
                   'que se hizo, y el proximo turno. Un solo boton al final hace todo junto.', P))
d.append(Spacer(1, 6 * mm))

d.append(Paragraph('Para sumar un paciente nuevo', H2))
d.append(Paragraph('No lo cargues vos. Entra a <b>Cartel</b>, imprimilo y pegalo en la '
                   'recepcion. El paciente le saca una foto al codigo con la camara del '
                   'celular, completa sus datos en dos minutos, y aparece solo en tu lista.', P))
d.append(Spacer(1, 6 * mm))

d.append(Paragraph('Si no entendes algo dentro del portal', H2))
d.append(Paragraph('Arriba a la derecha de cada pantalla hay un boton con un signo de '
                   'pregunta. Tocalo y te explica esa pantalla: para que sirve, como se usa '
                   'paso a paso, y donde suele estar la trampa.', P))

d.append(Spacer(1, 10 * mm))
d.append(aviso('<b>Lo unico que no hay que olvidarse:</b> antes de cargar tu primer paciente '
               'de verdad, entra a <b>Mi perfil</b>, anda hasta abajo de todo y usa el boton '
               'de vaciar. Borra los pacientes inventados que trae el portal de ejemplo.'))

doc = SimpleDocTemplate('INSTALAR_DESDE_CERO.pdf', pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Instalar el portal desde cero',
                        author='Portal de kinesiologia')
doc.build(d, onFirstPage=pie, onLaterPages=pie)
print('PDF listo')
