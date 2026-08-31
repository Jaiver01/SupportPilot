---
id: wifi-disable-adapter
title: Conexión WiFi - deshabilitar adaptador
---

# Conexión WiFi - deshabilitar adaptador

## Escenario recomendado para este procedimiento

Aplicar cuando el usuario reporta inestabilidad de red:

- "WiFi conectado pero sin internet"
- "Se desconecta cada pocos minutos"
- "Lentitud extrema al conectarse"

## Procedimiento

1. Abrir configuración de red del sistema operativo.
2. Localizar el adaptador inalámbrico activo.
3. **Deshabilitar** el adaptador WiFi.
4. Esperar 30 segundos.
5. Volver a habilitar el adaptador y reconectar.
6. Verificar latencia y estabilidad por al menos 3-5 minutos.

## Notas operativas

- Este procedimiento se usa como reinicio rápido del stack de red.
- Si hay VPN activa, pedir desconectarla temporalmente durante la prueba.

## Criterios para escalar

- Persisten cortes tras deshabilitar/habilitar el adaptador.
- Hay pérdida de conectividad en múltiples equipos de la misma ubicación.
- Se sospecha problema de AP corporativo o segmentación de red.
