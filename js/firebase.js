/* ══════════════════════════════════════════════════════════════════════
   ESTE ARCHIVO ES UN HUECO A PROPÓSITO

   No se escribe: se COPIA de la app del club (VOLLEY_NAFELS/firebase.js).
   Ese archivo ya trae la sesión, los roles, el modo sin internet y la
   llave, y está probado con gente usándolo. Reescribirlo es regalar
   trabajo y estrenar errores que allá ya están resueltos.

   Cuando lo copies, tocá dos líneas:

     var VB_STAFF = ['coach','at','pf','kine'];

     var VB_PLAYER_PATHS = ['wellness','pesos','rm','prep_hist','notas','obs',
                            'kine/adherencia','kine/agenda/turnos','kine/wellness'];

   El turno se deja escribir porque el jugador tiene que poder reservar.
   Que no pise a otro se valida en la REGLA DE FIREBASE, no acá:
   cualquiera abre la consola del navegador y se saltea un if.

   Y la base de datos va aparte de la del club. Los datos de salud no
   tienen por qué vivir donde vive el scouting.

   Mientras tanto, el portal funciona igual con los datos de ejemplo
   de datos.js. Este archivo vacío no rompe nada.
   ══════════════════════════════════════════════════════════════════════ */
