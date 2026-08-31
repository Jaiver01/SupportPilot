---
id: vpn-troubleshooting
title: Problemas de conexión VPN
---

# Problemas de conexión VPN

## Síntomas comunes reportados

- "No puedo acceder a la VPN"
- "No conecta la VPN corporativa"
- "Error de login en la VPN"
- "Usuario o contraseña inválidos"
- "Autenticación fallida"
- "Se queda en Connecting..."
- "Error 691" o "Error 809"
- "Desde celular sí funciona, desde laptop no"

## Validaciones rápidas

1. Confirmar si el usuario tiene internet estable (probar navegación normal).
2. Verificar si el incidente afecta a un usuario o a varios usuarios del mismo sitio.
3. Confirmar hora de inicio del problema y si antes funcionaba correctamente.
4. Validar que el reloj del equipo no esté desfasado (hora/fecha incorrecta puede romper autenticación).

## Procedimiento de diagnóstico y resolución

1. **Credenciales**
   - Solicitar reingreso manual de usuario y contraseña corporativa.
   - Confirmar que no haya bloqueo por mayúsculas, teclado en otro idioma o cuenta bloqueada.
2. **Cliente VPN**
   - Cerrar sesión en el cliente VPN.
   - Reiniciar el cliente VPN.
   - Si persiste, reiniciar el equipo.
3. **Red local**
   - Cambiar temporalmente de red (por ejemplo, hotspot móvil) para descartar bloqueo de router/ISP.
   - Desactivar y activar la interfaz de red.
4. **Mensajes específicos**
   - **Error 691 (login/auth):** validar credenciales y estado de la cuenta.
   - **Error 809 (túnel/firewall):** reiniciar equipo/router y probar otra red.

## Criterios para escalar

Escalar a nivel superior cuando:

- Hay múltiples usuarios afectados simultáneamente.
- El usuario tiene credenciales correctas y sigue con error de autenticación.
- El servicio VPN corporativo reporta degradación o caída.
- El problema persiste tras reinicio de cliente/equipo y prueba en red alternativa.
