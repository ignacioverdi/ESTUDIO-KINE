#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROBAR SW - comprueba que el portal abra aunque el servidor redirija.

Safari rechaza cualquier respuesta que el service worker devuelva si esa
respuesta vino de una redireccion, y la pagina directamente no abre.
Chrome lo tolera, asi que el error no aparece probando en la computadora:
aparece recien en el iPhone de otra persona.

Esto levanta un servidor que redirige a proposito, como hacia Vercel con
cleanUrls, y verifica que las pantallas carguen igual.

Necesita:  pip install playwright && playwright install chromium
"""
import http.server, socketserver, threading, os, functools
from playwright.sync_api import sync_playwright

class Redirector(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # imita cleanUrls: /panel.html -> 308 -> /panel
        if self.path.endswith('.html') and self.path != '/index.html' and '?' not in self.path:
            destino = self.path[:-5]
            self.send_response(308); self.send_header('Location', destino); self.end_headers(); return
        if self.path != '/' and '.' not in os.path.basename(self.path):
            self.path = self.path + '.html'
        return super().do_GET()
    def log_message(self, *a): pass

socketserver.TCPServer.allow_reuse_address = True   # si no, falla al repetir
# Puerto libre elegido por el sistema: con uno fijo, al correrlo dos veces
# seguidas falla porque el anterior todavia lo tiene tomado.
srv = socketserver.TCPServer(('127.0.0.1', 0), Redirector)
PUERTO = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(); pg = ctx.new_page()
    redirigidas = []
    pg.goto('http://127.0.0.1:%d/index.html' % PUERTO); pg.wait_for_timeout(3000)
    print('sw registrado :', pg.evaluate("!!navigator.serviceWorker.controller || navigator.serviceWorker.getRegistrations().then(function(r){return r.length>0})"))
    pg.wait_for_timeout(1500)
    # navegar entre pantallas y ver si alguna respuesta llega redirigida
    for u in ['panel.html','agenda.html','lesiones.html','caja.html']:
        r = pg.goto('http://127.0.0.1:%d/%s' % (PUERTO, u)); pg.wait_for_timeout(700)
        cargo = pg.evaluate("!!document.querySelector('h1.tit')")
        print('  %-16s estado %s | carga: %s' % (u, r.status, cargo))
        if not cargo: redirigidas.append(u)
    print('\npantallas que no cargaron:', redirigidas or 'ninguna')
    ctx.close(); b.close()
srv.shutdown()
