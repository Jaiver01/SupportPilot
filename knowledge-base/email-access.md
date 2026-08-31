---
id: email-access
title: Incidencias de acceso al correo corporativo
---

# Incidencias de acceso al correo corporativo

## Síntomas comunes reportados

- "No puedo entrar al correo"
- "Me rechaza la contraseña"
- "Error de login en Outlook / webmail"
- "No recibo correos desde ayer"
- "No puedo enviar, queda en bandeja de salida"
- "Me pide autenticación todo el tiempo"

## Datos mínimos a solicitar

1. Usuario afectado y dominio de correo.
2. Aplicación utilizada (Outlook, webmail, móvil).
3. Mensaje exacto del error (texto o captura).
4. Desde cuándo ocurre y si impacta envío, recepción o ambos.

## Procedimiento de diagnóstico y resolución

1. **Validar credenciales y estado de cuenta**
   - Confirmar usuario correcto.
   - Verificar bloqueo de cuenta o cambio reciente de contraseña.
2. **Comprobar servicio**
   - Revisar estado del servicio de correo en el dashboard interno.
   - Confirmar si hay incidente general activo.
3. **Reconfiguración básica del cliente**
   - Cerrar sesión y volver a iniciar.
   - Forzar sincronización manual.
   - Eliminar y volver a agregar perfil solo si existe respaldo o política aprobada.
4. **Prueba cruzada**
   - Probar en webmail si falla Outlook.
   - Probar con otra red para descartar restricciones locales.

## Criterios para escalar

Escalar a IT Security o Messaging cuando:

- La cuenta aparece bloqueada, comprometida o con MFA inconsistente.
- Hay posible compromiso (envíos no reconocidos, reglas extrañas, reenvíos sospechosos).
- Hay caída general del servicio o múltiples usuarios afectados.
