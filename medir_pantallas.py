#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MEDIR PANTALLAS — revisa el portal en celular, tablet y monitor.

Abre las 7 pantallas en 4 tamanos y busca tres cosas:

  desborde     algo que se sale por el costado y obliga a barrer
  chico        algo que se toca y mide menos de 44px de alto
  texto chico  letra por debajo de 9.5px

Los 44px no son un capricho: es el minimo con el que un dedo
acierta sin errores. En monitor no hace falta, porque el mouse
apunta fino: por eso ahi el limite es 30.

Necesita playwright:  pip install playwright && playwright install chromium
Se corre a mano, no es parte de EMPEZAR.bat: tarda como un minuto.
"""
from playwright.sync_api import sync_playwright
import pathlib, json
ARCH='file://'+str(pathlib.Path('ESTUDIO.html').resolve())
VISTAS=[('celular',390,844,True),('celular grande',430,932,True),('tablet',768,1024,True),('monitor',1440,900,False)]
PANT=[('kine','panel.html'),('kine','agenda.html'),('kine','lesiones.html?f=L1'),
      ('kine','pizarron.html'),('kine','ejercicios.html'),
      ('jugador','mi.html'),('jugador','diario.html')]
MEDIR="""(MIN) => {
  const r=[];
  const ancho=document.documentElement.clientWidth;
  // desborde horizontal
  document.querySelectorAll('*').forEach(e=>{
    const b=e.getBoundingClientRect();
    if(b.width>0 && b.right>ancho+2) r.push({t:'desborde',q:e.className||e.tagName,px:Math.round(b.right-ancho)});
  });
  // objetivos tactiles chicos (44px es el minimo recomendado)
  document.querySelectorAll('button,a,input,select,.pest,.pz,.crit').forEach(e=>{
    if(e.tagName==='INPUT' && e.closest('label')) return;
    const b=e.getBoundingClientRect();
    if(b.width>0 && b.height>0 && (b.height<MIN||b.width<28))
      r.push({t:'chico',q:(e.className||e.tagName)+' "'+(e.textContent||'').trim().slice(0,14)+'"',
              px:Math.round(b.width)+'x'+Math.round(b.height)});
  });
  // texto minusculo
  document.querySelectorAll('*').forEach(e=>{
    if(e.children.length===0 && e.textContent.trim()){
      const f=parseFloat(getComputedStyle(e).fontSize);
      if(f<9.5) r.push({t:'texto chico',q:e.className||e.tagName,px:f+'px'});
    }
  });
  return r;
}"""
res={}
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for vn,w,h,tactil in VISTAS:
        pg=b.new_page(viewport={'width':w,'height':h},
                      has_touch=tactil, is_mobile=tactil)
        pg.goto(ARCH); pg.wait_for_timeout(2000)
        for rol,url in PANT:
            pg.evaluate(f"ponerRol('{rol}'); ponerDorsal(7); irA('{url}')"); pg.wait_for_timeout(700)
            for x in pg.evaluate(MEDIR, 44 if tactil else 30):
                k=(vn,url,x['t'],str(x['q'])[:46])
                res[k]=x['px']
        pg.close()
    b.close()
print('%d hallazgos únicos\n' % len(res))
por={}
for (vn,url,t,q),px in res.items():
    por.setdefault((vn,t),[]).append('%s | %s (%s)'%(url,q,px))
for k in sorted(por):
    print('── %s · %s (%d)' % (k[0],k[1],len(por[k])))
    for x in sorted(set(por[k]))[:8]: print('    ',x)
