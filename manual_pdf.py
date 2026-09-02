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



DIRECCION = 'estudio-kine.vercel.app'

MONO = ParagraphStyle('MONO', fontName='Courier-Bold', fontSize=13, leading=18,
                      textColor=AZUL, spaceAfter=6)
COLORES = {'CAJA': (AZUL, '#E9F4F6'), 'VERDE': (VERDE, '#EAF4EE'),
           'AMBAR': (AMBAR, '#FBF3E6'), 'ROJO': (ROJO, '#FBEDEB')}


def direccion_grande():
    """El dato mas importante del manual. Sin esto no se puede ni entrar."""
    dentro = [Paragraph('LA DIRECCION DEL PORTAL', ParagraphStyle('t',
                fontName='Helvetica-Bold', fontSize=9, textColor=colors.white,
                alignment=1, spaceAfter=6)),
              Paragraph(DIRECCION, ParagraphStyle('d', fontName='Courier-Bold',
                fontSize=19, leading=26, textColor=colors.white, alignment=1,
                spaceAfter=8)),
              Paragraph('Escribila en la barra de arriba del navegador, tal cual, sin www.',
                ParagraphStyle('p', fontName='Helvetica', fontSize=9.5, leading=13,
                textColor=colors.HexColor('#BFE4EA'), alignment=1))]
    t = Table([[dentro]], colWidths=[165 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), AZUL),
        ('LEFTPADDING', (0, 0), (-1, -1), 14), ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 13), ('BOTTOMPADDING', (0, 0), (-1, -1), 13)]))
    return t


# ══════════════════════════════════════════════════════════════════════
#  EL TEXTO VIVE EN manual.txt, NO ACA
#
#  Antes el manual estaba escrito adentro del codigo. Cada correccion
#  obligaba a tocar Python, y una comilla mal puesta rompia el archivo
#  entero: paso.
#
#  Ahora el texto es un archivo aparte que se edita como cualquier
#  documento. Las marcas son cuatro:
#
#     #titulo        una pagina nueva empieza asi
#     ##subtitulo
#     |a|b           una fila de tabla (la primera es el encabezado)
#     @@ANCHOS 40 125   el ancho de las columnas, en milimetros
#     1|titulo|texto    un paso numerado
#     %VERDE|texto      un recuadro de color: CAJA, VERDE, AMBAR o ROJO
#     -texto            una linea en letra chica
#     @DIRECCION        el recuadro con la direccion
#     @SALTO            corta la pagina
# ══════════════════════════════════════════════════════════════════════
import os, io
RAIZ = os.path.dirname(os.path.abspath(__file__))
lineas = io.open(os.path.join(RAIZ, 'manual.txt'), encoding='utf-8').read().split('\n')

d = []
tabla_actual = []
primera_pagina = True


def volcar_tabla(anchos=None):
    """Suelta la tabla que se venia juntando."""
    global tabla_actual
    if not tabla_actual:
        return
    n = len(tabla_actual[0])
    if not anchos:
        anchos = [165.0 / n] * n
    d.append(tabla([Paragraph('<b>%s</b>' % c, ParagraphStyle('th',
                    fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.white))
                    for c in tabla_actual[0]],
                   [[Paragraph(c, ParagraphStyle('td', fontName='Helvetica',
                     fontSize=9.5, leading=12.5, textColor=TINTA)) for c in fila]
                    for fila in tabla_actual[1:]],
                   [a * mm for a in anchos]))
    d.append(Spacer(1, 4 * mm))
    tabla_actual = []


for cruda in lineas:
    l = cruda.rstrip()
    if not l.strip():
        continue

    if l.startswith('@@ANCHOS'):
        volcar_tabla([float(x) for x in l.split()[1:]])
        continue
    if not l.startswith('|'):
        volcar_tabla()

    if l == '@SALTO':
        d.append(PageBreak())
    elif l == '@DIRECCION':
        d.append(direccion_grande())
        d.append(Spacer(1, 6 * mm))
    elif l.startswith('##'):
        d.append(Paragraph(l[2:].strip(), H2))
    elif l.startswith('#'):
        d.append(Paragraph(l[1:].strip(), H1))
    elif l.startswith('|'):
        tabla_actual.append([c.strip() for c in l[1:].split('|')])
    elif l.startswith('%'):
        clave, txt = l[1:].split('|', 1)
        col, fondo = COLORES.get(clave.strip(), COLORES['CAJA'])
        d.append(caja(txt.strip(), col, fondo))
        d.append(Spacer(1, 4 * mm))
    elif l.startswith('-'):
        d.append(Paragraph(l[1:].strip(), CHICO))
    elif l[0].isdigit() and '|' in l:
        n, titulo, cuerpo = l.split('|', 2)
        d.append(paso(n.strip(), titulo.strip(), cuerpo.strip()))
    elif primera_pagina and not d:
        d.append(Paragraph(l, H1))
    elif len(d) == 1:
        d.append(Paragraph(l, SUB))
    else:
        d.append(Paragraph(l, P))
    primera_pagina = False

volcar_tabla()

doc = SimpleDocTemplate('COMO_SE_USA.pdf', pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Como se usa el portal', author='Portal de kinesiologia')
doc.build(d, onFirstPage=pie, onLaterPages=pie)
print('PDF listo — el texto se edita en manual.txt')
